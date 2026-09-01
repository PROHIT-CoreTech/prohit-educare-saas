import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Financial Year 2026-27 (Apr 1 2026 - Mar 31 2027)
    const fyStart = new Date(2026, 3, 1); // Apr 1, 2026
    const fyEnd = new Date(2027, 2, 31, 23, 59, 59, 999); // Mar 31, 2027

    // 1. Total Admissions (Academic Year 2026-27 enrolled students)
    const totalAdmissions = await this.studentModel.countDocuments({
      academyId,
      status: 'ACTIVE',
    });

    // 2. Daily Collection (Today's settled cash/online receipts)
    const dailyStats = await this.paymentModel.aggregate([
      { $match: { academyId, paymentDate: { $gte: startOfToday, $lte: endOfToday } } },
      { $group: { _id: null, total: { $sum: '$totalAmountPaid' } } },
    ]);
    const dailyCollection = dailyStats[0]?.total || 0;

    // 3. Monthly Fees Collection (Current month settled)
    const monthlyStats = await this.paymentModel.aggregate([
      { $match: { academyId, paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmountPaid' } } },
    ]);
    const monthlyCollection = monthlyStats[0]?.total || 0;

    // 4. Monthly Fees Collection Pending (Current month outstanding dues)
    const pendingMonthlyStats = await this.feeScheduleModel.aggregate([
      {
        $match: {
          academyId,
          dueDate: { $gte: startOfMonth, $lte: endOfMonth },
          status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
        },
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: { $subtract: ['$amount', '$paidAmount'] } },
        },
      },
    ]);
    const monthlyCollectionPending = pendingMonthlyStats[0]?.totalPending || 0;

    // 5. FY 2026-27 Collection
    const fyStats = await this.paymentModel.aggregate([
      { $match: { academyId, paymentDate: { $gte: fyStart, $lte: fyEnd } } },
      { $group: { _id: null, total: { $sum: '$totalAmountPaid' } } },
    ]);
    const fyCollection = fyStats[0]?.total || 0;

    // Overall Fee Totals
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

    const totalBilled = feeStats[0]?.totalBilled || 0;
    const totalPaid = feeStats[0]?.totalPaidFromSchedules || 0;
    const remainingBalance = Math.max(0, totalBilled - totalPaid);

    return {
      totalAdmissions,
      dailyCollection,
      monthlyCollection,
      monthlyCollectionPending,
      fyCollection,
      totalBilled,
      totalPaid,
      remainingBalance,
      pendingInstallments: feeStats[0]?.pendingCount || 0,
      overdueInstallments: feeStats[0]?.overdueCount || 0,
    };
  }

  async getPaginatedPayments(query: {
    page?: number;
    limit?: number;
    standard?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const academyId = this.tenantContextService.academyId;
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, query.limit || 10);
    const skip = (page - 1) * limit;

    const matchFilter: any = { academyId };

    if (query.startDate || query.endDate) {
      matchFilter.paymentDate = {};
      if (query.startDate) matchFilter.paymentDate.$gte = new Date(query.startDate);
      if (query.endDate) matchFilter.paymentDate.$lte = new Date(query.endDate);
    }

    if (query.standard && query.standard !== 'all') {
      const stdNum = parseInt(query.standard, 10);
      const studentIds = await this.studentModel.find({ academyId, standard: stdNum }).distinct('_id');
      matchFilter.studentId = { $in: studentIds };
    }

    const [data, total] = await Promise.all([
      this.paymentModel
        .find(matchFilter)
        .populate('studentId', 'name studentCode parentPhone standard medium')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paymentModel.countDocuments(matchFilter),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getTrendAnalytics(resolution: 'Daily' | 'Monthly' | 'Yearly' | '3-Year' | '5-Year', standard?: string) {
    const academyId = this.tenantContextService.academyId;
    const matchFilter: any = { academyId };

    if (standard && standard !== 'all') {
      const stdNum = parseInt(standard, 10);
      const studentIds = await this.studentModel.find({ academyId, standard: stdNum }).distinct('_id');
      matchFilter.studentId = { $in: studentIds };
    }

    let groupFormat: any = {};
    if (resolution === 'Daily') {
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } };
    } else if (resolution === 'Monthly') {
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$paymentDate' } };
    } else {
      groupFormat = { $dateToString: { format: '%Y', date: '$paymentDate' } };
    }

    const trend = await this.paymentModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: groupFormat,
          amount: { $sum: '$totalAmountPaid' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: resolution === '3-Year' ? 3 : resolution === '5-Year' ? 5 : 30 },
    ]);

    return trend.map((t) => ({ label: t._id, amount: t.amount, count: t.count }));
  }

  async getProfitAndLoss(interval: 'Monthly' | 'Quarterly' | 'Yearly') {
    const academyId = this.tenantContextService.academyId;

    const payments = await this.paymentModel.aggregate([
      { $match: { academyId } },
      { $group: { _id: null, grossRevenue: { $sum: '$totalAmountPaid' } } },
    ]);

    const grossRevenue = payments[0]?.grossRevenue || 0;

    // Simulated operational cost structure based on interval (Staff Salaries, Infrastructure, Software ERP, Maintenance)
    const multiplier = interval === 'Quarterly' ? 3 : interval === 'Yearly' ? 12 : 1;

    const facultySalaries = Math.round(grossRevenue * 0.35);
    const infrastructureRent = Math.round(grossRevenue * 0.12);
    const techErpLicense = Math.round(grossRevenue * 0.05);
    const adminUtilities = Math.round(grossRevenue * 0.08);

    const totalExpenses = facultySalaries + infrastructureRent + techErpLicense + adminUtilities;
    const netProfit = grossRevenue - totalExpenses;
    const profitMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0';

    return {
      interval,
      grossRevenue,
      expenses: {
        facultySalaries,
        infrastructureRent,
        techErpLicense,
        adminUtilities,
        totalExpenses,
      },
      netProfit,
      profitMargin: `${profitMargin}%`,
    };
  }

  async getRecentPayments(limit: number = 20) {
    const academyId = this.tenantContextService.academyId;
    return this.paymentModel
      .find({ academyId })
      .populate('studentId', 'name studentCode parentPhone standard medium')
      .sort({ paymentDate: -1 })
      .limit(limit)
      .exec();
  }
}
