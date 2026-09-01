import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from '../../database/schemas/student.schema';
import { Counter, CounterDocument } from '../../database/schemas/counter.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { FeeEngineService } from '../fee-engine/fee-engine.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
    private tenantContextService: TenantContextService,
    private feeEngineService: FeeEngineService,
  ) {}

  async create(dto: {
    name: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    classBatchId: string;
    standard: number;
    medium?: string;
    stream?: string;
    dateOfBirth?: Date;
    photoUrl?: string;
    bloodGroup?: string;
    emergencyContactName?: string;
    emergencyPhone?: string;
    address?: string;
    rollNo?: string;
    validUpto?: string;
    discountAmount?: number;
    paymentType?: 'FULL' | 'INSTALLMENT';
    installmentCount?: number;
    customTotalFee?: number;
  }) {
    const academyId = this.tenantContextService.academyId;
    const currentYear = new Date().getFullYear();
    const counterId = `student_${academyId.toString()}_${currentYear}`;

    let counter = await this.counterModel.findOne({ _id: counterId }).exec();
    if (!counter) {
      const existingCount = await this.studentModel.countDocuments({ academyId });
      counter = await this.counterModel.findOneAndUpdate(
        { _id: counterId },
        { $setOnInsert: { seq: existingCount } },
        { upsert: true, new: true },
      );
    }

    counter = await this.counterModel.findOneAndUpdate(
      { _id: counterId },
      { $inc: { seq: 1 } },
      { new: true },
    );

    const seqNumber = counter.seq.toString().padStart(5, '0');
    const studentCode = `STU-${currentYear}-${seqNumber}`;

    const student = await this.studentModel.create({
      academyId,
      studentCode,
      name: dto.name,
      parentName: dto.parentName,
      parentPhone: dto.parentPhone,
      parentEmail: dto.parentEmail,
      classBatchId: new Types.ObjectId(dto.classBatchId),
      standard: dto.standard,
      medium: dto.medium || (dto.standard >= 11 ? 'english' : 'english'),
      stream: dto.stream || (dto.standard >= 11 ? 'science' : 'none'),
      discountAmount: dto.discountAmount || 0,
      paymentType: dto.paymentType || 'FULL',
      installmentCount: dto.paymentType === 'INSTALLMENT' ? (dto.installmentCount || 3) : 1,
      customTotalFee: dto.customTotalFee,
      dateOfBirth: dto.dateOfBirth,
      photoUrl: dto.photoUrl,
      bloodGroup: dto.bloodGroup,
      emergencyContactName: dto.emergencyContactName || dto.parentName,
      emergencyPhone: dto.emergencyPhone || dto.parentPhone,
      address: dto.address,
      rollNo: dto.rollNo || studentCode,
      validUpto: dto.validUpto || `31-MAR-${currentYear + 1}`,
      status: 'ACTIVE',
      advanceBalance: 0,
    });

    try {
      await this.feeEngineService.assignCustomFeeToStudent({
        studentId: student._id.toString(),
        standard: dto.standard,
        discountAmount: dto.discountAmount || 0,
        paymentType: dto.paymentType || 'FULL',
        installmentCount: dto.paymentType === 'INSTALLMENT' ? (dto.installmentCount || 3) : 1,
        customTotalFee: dto.customTotalFee,
      });
    } catch (e) {
      // Non-fatal fee assignment fallback
    }

    return student;
  }

  async findAll() {
    const academyId = this.tenantContextService.academyId;
    return this.studentModel.find({ academyId }).populate('classBatchId').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const academyId = this.tenantContextService.academyId;
    const student = await this.studentModel.findOne({ _id: id, academyId }).populate('classBatchId').exec();
    if (!student) throw new NotFoundException('Student not found or does not belong to this tenant');
    return student;
  }

  async update(id: string, dto: Partial<Student>) {
    const academyId = this.tenantContextService.academyId;
    const updated = await this.studentModel
      .findOneAndUpdate({ _id: id, academyId }, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Student not found or cross-tenant update rejected');
    return updated;
  }

  async promote(id: string, dto: {
    targetStandard: number;
    classBatchId: string;
    medium?: string;
    stream?: string;
    customTotalFee?: number;
    discountAmount?: number;
    paymentType?: 'FULL' | 'INSTALLMENT';
    installmentCount?: number;
  }) {
    const academyId = this.tenantContextService.academyId;
    const student = await this.studentModel.findOne({ _id: id, academyId }).exec();
    if (!student) throw new NotFoundException('Student not found');

    student.standard = dto.targetStandard;
    if (dto.classBatchId && Types.ObjectId.isValid(dto.classBatchId)) {
      student.classBatchId = new Types.ObjectId(dto.classBatchId);
    }
    if (dto.medium) student.medium = dto.medium;
    if (dto.stream) student.stream = dto.stream;
    if (dto.discountAmount !== undefined) student.discountAmount = dto.discountAmount;
    if (dto.paymentType) student.paymentType = dto.paymentType;
    if (dto.installmentCount) student.installmentCount = dto.installmentCount;
    if (dto.customTotalFee !== undefined) student.customTotalFee = dto.customTotalFee;
    student.status = 'ACTIVE';

    await student.save();

    try {
      await this.feeEngineService.assignCustomFeeToStudent({
        studentId: student._id.toString(),
        standard: dto.targetStandard,
        discountAmount: dto.discountAmount || 0,
        paymentType: dto.paymentType || 'FULL',
        installmentCount: dto.paymentType === 'INSTALLMENT' ? (dto.installmentCount || 3) : 1,
        customTotalFee: dto.customTotalFee,
      });
    } catch (e) {
      // Non-fatal fee assignment fallback
    }

    return student;
  }

  async remove(id: string) {
    const academyId = this.tenantContextService.academyId;
    const res = await this.studentModel.deleteOne({ _id: id, academyId }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Student not found or cross-tenant deletion rejected');
    return { message: 'Student deleted successfully' };
  }
}
