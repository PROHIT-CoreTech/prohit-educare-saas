import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FeeSchedule, FeeScheduleDocument } from '../../database/schemas/fee-schedule.schema';
import { Payment, PaymentDocument } from '../../database/schemas/payment.schema';
import { Student, StudentDocument } from '../../database/schemas/student.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(FeeSchedule.name) private feeScheduleModel: Model<FeeScheduleDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private tenantContextService: TenantContextService,
  ) {}

  async getFinancialOverview() {
    const academyId = this.tenantContextService.academyId;

    // Aggregation pipeline for fee schedules (Billed vs Paid)
    const feeStats = await this.feeScheduleModel.aggregate([
      { $match: { academyId } },
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$amount' },
          totalPaidFromSchedules: { $sum: '$paidAmount' },
          pendingCount: {
            $sum: { $cond: [{ $in: ['$status', ['PENDING', 'PARTIAL', 'OVERDUE']] }, 1, 0] },
          },
          overdueCount: {
            $sum: { $cond: [{ $eq: ['$status', 'OVERDUE'] }, 1, 0] },
          },
        },
      },
    ]);

    // Aggregation pipeline for payment records
    const paymentStats = await this.paymentModel.aggregate([
      { $match: { academyId } },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$totalAmountPaid' },
          totalAdvanceAdded: { $sum: '$advanceAdded' },
          paymentCount: { $sum: 1 },
        },
      },
    ]);

    // Aggregation pipeline for student advances
    const studentStats = await this.studentModel.aggregate([
      { $match: { academyId } },
      {
        $group: {
          _id: null,
          totalAdvanceBalance: { $sum: '$advanceBalance' },
          activeStudentCount: {
            $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] },
          },
        },
      },
    ]);

    const totalBilled = feeStats[0]?.totalBilled || 0;
    const totalPaid = feeStats[0]?.totalPaidFromSchedules || 0;
    const remainingBalance = Math.max(0, totalBilled - totalPaid);
    const advanceBalance = studentStats[0]?.totalAdvanceBalance || 0;
    const totalCollected = paymentStats[0]?.totalCollected || 0;

    return {
      totalBilled,
      totalPaid,
      remainingBalance,
      advanceBalance,
      totalCollected,
      activeStudentCount: studentStats[0]?.activeStudentCount || 0,
      pendingInstallments: feeStats[0]?.pendingCount || 0,
      overdueInstallments: feeStats[0]?.overdueCount || 0,
    };
  }

  async getRecentPayments(limit: number = 20) {
    const academyId = this.tenantContextService.academyId;
    return this.paymentModel
      .find({ academyId })
      .populate('studentId', 'name studentCode parentPhone')
      .sort({ paymentDate: -1 })
      .limit(limit)
      .exec();
  }
}
