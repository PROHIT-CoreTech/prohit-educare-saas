import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { FeeStructure, FeeStructureDocument } from '../../database/schemas/fee-structure.schema';
import { FeeSchedule, FeeScheduleDocument } from '../../database/schemas/fee-schedule.schema';
import { Student, StudentDocument } from '../../database/schemas/student.schema';
import { Payment, PaymentDocument, PaymentAllocation } from '../../database/schemas/payment.schema';
import { Counter, CounterDocument } from '../../database/schemas/counter.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Injectable()
export class FeeEngineService {
  private readonly logger = new Logger(FeeEngineService.name);

  constructor(
    @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructureDocument>,
    @InjectModel(FeeSchedule.name) private feeScheduleModel: Model<FeeScheduleDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
    @InjectConnection() private readonly connection: Connection,
    private tenantContextService: TenantContextService,
  ) {}

  generateInstallmentBreakdown(totalAmount: number, installmentsCount: number, startDate: Date = new Date()) {
    const validCount = Math.max(1, installmentsCount || 1);
    const validTotal = Math.max(0, totalAmount || 0);

    const baseAmount = Math.floor(validTotal / validCount);
    const remainder = validTotal - baseAmount * validCount;

    const breakdown = [];
    for (let i = 1; i <= validCount; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + (i - 1));

      const amount = i === validCount ? baseAmount + remainder : baseAmount;

      breakdown.push({
        installmentNo: i,
        dueDate,
        amount,
      });
    }

    return breakdown;
  }

  async createFeeStructure(dto: { standard: number; medium?: string; stream?: string; name: string; totalAmount: number; installmentsCount: number; startDate?: Date }) {
    const academyId = this.tenantContextService.academyId;
    const breakdown = this.generateInstallmentBreakdown(dto.totalAmount, dto.installmentsCount, dto.startDate ? new Date(dto.startDate) : new Date());

    const feeStructure = await this.feeStructureModel.create({
      academyId,
      standard: dto.standard,
      medium: dto.medium || (dto.standard >= 11 ? 'english' : 'english'),
      stream: dto.stream || (dto.standard >= 11 ? 'science' : 'none'),
      name: dto.name,
      totalAmount: dto.totalAmount,
      installmentsCount: dto.installmentsCount,
      installmentBreakdown: breakdown,
    });

    // Auto-assign fee structure to all students in this standard who don't have fee schedules
    const studentsInStandard = await this.studentModel.find({ academyId, standard: dto.standard }).exec();
    for (const student of studentsInStandard) {
      const existingCount = await this.feeScheduleModel.countDocuments({ academyId, studentId: student._id });
      if (existingCount === 0) {
        await this.assignFeeStructureToStudent(student._id.toString(), feeStructure._id.toString());
      }
    }

    return feeStructure;
  }

  async getFeeStructures() {
    const academyId = this.tenantContextService.academyId;
    return this.feeStructureModel.find({ academyId }).sort({ standard: 1 }).exec();
  }

  async assignFeeStructureToStudent(studentId: string, feeStructureId: string) {
    const academyId = this.tenantContextService.academyId;
    const student = await this.studentModel.findOne({ _id: studentId, academyId }).exec();
    if (!student) throw new NotFoundException('Student not found');

    const feeStructure = await this.feeStructureModel.findOne({ _id: feeStructureId, academyId }).exec();
    if (!feeStructure) throw new NotFoundException('Fee structure not found');

    // Create fee schedules for student
    const schedules = [];
    for (const inst of feeStructure.installmentBreakdown) {
      const schedule = await this.feeScheduleModel.create({
        academyId,
        studentId: student._id,
        feeStructureId: feeStructure._id,
        installmentNo: inst.installmentNo,
        dueDate: inst.dueDate,
        amount: inst.amount,
        paidAmount: 0,
        status: 'PENDING',
      });
      schedules.push(schedule);
    }

    // Auto-settle advance balance if student has advance credit
    if (student.advanceBalance > 0) {
      for (const schedule of schedules) {
        if (student.advanceBalance <= 0) break;
        const due = schedule.amount - schedule.paidAmount;
        if (due <= 0) continue;

        const allocation = Math.min(student.advanceBalance, due);
        schedule.paidAmount += allocation;
        student.advanceBalance -= allocation;

        if (schedule.paidAmount >= schedule.amount) {
          schedule.status = 'PAID';
        } else {
          schedule.status = 'PARTIAL';
        }

        await schedule.save();
      }
      await student.save();
    }

    return schedules;
  }

  async assignCustomFeeToStudent(params: {
    studentId: string;
    standard: number;
    discountAmount?: number;
    paymentType?: 'FULL' | 'INSTALLMENT';
    installmentCount?: number;
    customTotalFee?: number;
  }) {
    const academyId = this.tenantContextService.academyId;
    const student = await this.studentModel.findOne({ _id: params.studentId, academyId }).exec();
    if (!student) throw new NotFoundException('Student not found');

    let baseFee = params.customTotalFee;
    if (!baseFee || baseFee <= 0) {
      let feeStructure;
      if (params.standard >= 11 && student.stream && student.stream !== 'none') {
        feeStructure = await this.feeStructureModel.findOne({ academyId, standard: params.standard, stream: student.stream }).exec();
      } else if (params.standard <= 10 && student.medium) {
        feeStructure = await this.feeStructureModel.findOne({ academyId, standard: params.standard, medium: student.medium }).exec();
      }
      if (!feeStructure) {
        feeStructure = await this.feeStructureModel.findOne({ academyId, standard: params.standard }).exec();
      }
      baseFee = feeStructure ? feeStructure.totalAmount : (params.standard >= 11 ? 50000 : 35000);
    }

    const discount = Math.max(0, params.discountAmount || 0);
    const netFee = Math.max(0, baseFee - discount);
    const count = params.paymentType === 'INSTALLMENT' ? Math.max(1, params.installmentCount || 3) : 1;

    const breakdown = this.generateInstallmentBreakdown(netFee, count, new Date());

    await this.feeScheduleModel.deleteMany({ academyId, studentId: student._id, paidAmount: 0 });

    const schedules = [];
    for (const inst of breakdown) {
      const schedule = await this.feeScheduleModel.create({
        academyId,
        studentId: student._id,
        installmentNo: inst.installmentNo,
        dueDate: inst.dueDate,
        amount: inst.amount,
        paidAmount: 0,
        status: 'PENDING',
      });
      schedules.push(schedule);
    }

    return schedules;
  }

  async recordPayment(dto: {
    studentId: string;
    amountPaid: number;
    paymentMode: string;
    transactionRef?: string;
  }) {
    const academyId = this.tenantContextService.academyId;
    const userId = this.tenantContextService.userId;
    const { studentId, amountPaid, paymentMode, transactionRef } = dto;

    if (amountPaid <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    const student = await this.studentModel.findOne({ _id: studentId, academyId }).exec();
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Get atomic receipt number sequence per academy
      const currentYear = new Date().getFullYear();
      const counterId = `receipt_${academyId.toString()}_${currentYear}`;

      const counter = await this.counterModel.findOneAndUpdate(
        { _id: counterId },
        { $inc: { seq: 1 } },
        { upsert: true, new: true, session },
      );

      const seqNumber = counter.seq.toString().padStart(5, '0');
      const receiptNumber = `REC-${currentYear}-${seqNumber}`;

      // 2. Fetch all unpaid/partially paid fee schedules for student in FIFO order (dueDate ASC)
      const feeSchedules = await this.feeScheduleModel
        .find({
          academyId,
          studentId: student._id,
          status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
        })
        .sort({ dueDate: 1 })
        .session(session)
        .exec();

      let remainingPayment = amountPaid;
      const allocations: PaymentAllocation[] = [];
      let advanceAdded = 0;

      // 3. FIFO allocation across fee schedules
      for (const schedule of feeSchedules) {
        if (remainingPayment <= 0) break;

        const dueForThisSchedule = schedule.amount - schedule.paidAmount;
        if (dueForThisSchedule <= 0) continue;

        const allocation = Math.min(remainingPayment, dueForThisSchedule);
        schedule.paidAmount += allocation;
        remainingPayment -= allocation;

        if (schedule.paidAmount >= schedule.amount) {
          schedule.status = 'PAID';
        } else {
          schedule.status = 'PARTIAL';
        }

        await schedule.save({ session });
        allocations.push({
          feeScheduleId: schedule._id,
          allocatedAmount: allocation,
        });
      }

      // 4. Overpayment accrues as advance credit
      if (remainingPayment > 0) {
        advanceAdded = remainingPayment;
        student.advanceBalance += advanceAdded;
        await student.save({ session });
      }

      // 5. Create Payment record
      const paymentDoc = new this.paymentModel({
        academyId,
        receiptNumber,
        studentId: student._id,
        paymentDate: new Date(),
        totalAmountPaid: amountPaid,
        paymentMode: paymentMode || 'UPI',
        transactionRef: transactionRef || '',
        allocations,
        advanceAdded,
        createdByUserId: userId,
      });

      await paymentDoc.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        message: 'Payment recorded successfully',
        payment: paymentDoc,
        receiptNumber,
        allocations,
        advanceBalance: student.advanceBalance,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      this.logger.error('Error recording payment, transaction rolled back', error);
      throw error;
    }
  }

  async getStudentFeeSummary(studentId: string) {
    const academyId = this.tenantContextService.academyId;
    const student = await this.studentModel.findOne({ _id: studentId, academyId }).exec();
    if (!student) throw new NotFoundException('Student not found');

    let feeSchedules = await this.feeScheduleModel.find({ academyId, studentId: student._id }).sort({ dueDate: 1 }).exec();

    if (feeSchedules.length === 0) {
      feeSchedules = await this.assignCustomFeeToStudent({
        studentId: student._id.toString(),
        standard: student.standard,
        discountAmount: student.discountAmount || 0,
        paymentType: (student.paymentType as 'FULL' | 'INSTALLMENT') || 'FULL',
        installmentCount: student.installmentCount || 1,
        customTotalFee: student.customTotalFee,
      });
    }

    const payments = await this.paymentModel.find({ academyId, studentId: student._id }).sort({ paymentDate: -1 }).exec();

    const totalBilled = feeSchedules.reduce((acc, s) => acc + s.amount, 0);
    const totalPaid = feeSchedules.reduce((acc, s) => acc + s.paidAmount, 0);
    const remainingBalance = Math.max(0, totalBilled - totalPaid);

    return {
      student,
      feeSchedules,
      payments,
      summary: {
        totalBilled,
        totalPaid,
        remainingBalance,
        advanceBalance: student.advanceBalance,
      },
    };
  }
}
