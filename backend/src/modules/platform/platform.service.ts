import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { PlatformUser, PlatformUserDocument } from '../../database/schemas/platform-user.schema';
import { PlatformAuditLog, PlatformAuditLogDocument } from '../../database/schemas/platform-audit-log.schema';
import { Academy, AcademyDocument } from '../../database/schemas/academy.schema';
import { Student, StudentDocument } from '../../database/schemas/student.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Payment, PaymentDocument } from '../../database/schemas/payment.schema';
import { FeeSchedule, FeeScheduleDocument } from '../../database/schemas/fee-schedule.schema';
import { ClassBatch, ClassBatchDocument } from '../../database/schemas/class-batch.schema';

@Injectable()
export class PlatformService {
  constructor(
    @InjectModel(PlatformUser.name) private platformUserModel: Model<PlatformUserDocument>,
    @InjectModel(PlatformAuditLog.name) private platformAuditLogModel: Model<PlatformAuditLogDocument>,
    @InjectModel(Academy.name) private academyModel: Model<AcademyDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(FeeSchedule.name) private feeScheduleModel: Model<FeeScheduleDocument>,
    @InjectModel(ClassBatch.name) private classBatchModel: Model<ClassBatchDocument>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.platformUserModel.findOne({ email: email.toLowerCase().trim() }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid platform credentials');
    }
    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid platform credentials');
    }

    const payload = {
      sub: user._id.toString(),
      type: 'PLATFORM',
      platformRole: user.role,
      email: user.email,
      name: user.name,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
      expiresIn: '1d',
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMetrics() {
    const totalAcademies = await this.academyModel.countDocuments();
    const activeAcademies = await this.academyModel.countDocuments({ subscriptionStatus: 'ACTIVE' });
    const trialAcademies = await this.academyModel.countDocuments({ subscriptionStatus: 'TRIAL' });
    const totalStudents = await this.studentModel.countDocuments();

    // Standard plan monthly rate default ₹2,999
    const mrr = activeAcademies * 2999;

    return {
      totalAcademies,
      activeAcademies,
      trialAcademies,
      totalStudents,
      mrr,
      currency: 'INR',
    };
  }

  async getAllAcademies() {
    return this.academyModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Returns all platform subscription transaction and audit logs
   */
  async getPlatformAuditLogs() {
    const auditLogs = await this.platformAuditLogModel
      .find()
      .populate('platformUserId', 'name email')
      .populate('academyId', 'name slug subscriptionStatus trialEndsAt subscriptionEndsAt createdAt')
      .sort({ createdAt: -1 })
      .exec();

    const academies = await this.academyModel.find().exec();
    const existingAcademyIdsInTransactionAudit = new Set(
      auditLogs
        .filter((log: any) => log.action !== 'IMPERSONATE_START')
        .map((log: any) => (log.academyId?._id ? log.academyId._id.toString() : log.academyId?.toString()))
    );

    const syntheticLogs: any[] = [];
    for (const academy of academies) {
      if (!existingAcademyIdsInTransactionAudit.has(academy._id.toString())) {
        const isTrial = academy.subscriptionStatus === 'TRIAL';
        syntheticLogs.push({
          _id: `sub_log_${academy._id}`,
          academyId: academy,
          action: isTrial ? '14-Day Free Trial Started' : 'Subscription Provisioned',
          createdAt: academy.createdAt,
          details: {
            academyName: academy.name,
            academySlug: academy.slug,
            plan: isTrial ? 'TRIAL_14_DAYS' : 'PROFESSIONAL',
            amount: isTrial ? 0 : 35988,
            paymentMode: isTrial ? 'FREE_TRIAL' : 'OFFLINE_CASH',
            subscriptionStart: academy.createdAt,
            subscriptionExpiry:
              academy.subscriptionStatus === 'ACTIVE'
                ? academy.subscriptionEndsAt || new Date(new Date(academy.createdAt).setFullYear(new Date(academy.createdAt).getFullYear() + 1))
                : academy.trialEndsAt,
          },
        });
      }
    }

    return [...auditLogs, ...syntheticLogs].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateAcademyStatus(id: string, status: string) {
    const academy = await this.academyModel.findById(id).exec();
    if (!academy) throw new NotFoundException('Academy not found');
    academy.subscriptionStatus = status;
    if (status === 'ACTIVE' && !academy.subscriptionEndsAt) {
      const subEndsAt = new Date();
      subEndsAt.setFullYear(subEndsAt.getFullYear() + 1);
      academy.subscriptionEndsAt = subEndsAt;
    }
    await academy.save();
    return academy;
  }

  async updateAcademyCategory(id: string, dto: { institutionType?: string; institutionTypes?: string[]; educationBoard?: string; educationBoards?: string[] }) {
    const academy = await this.academyModel.findById(id).exec();
    if (!academy) throw new NotFoundException('Academy not found');
    
    if (Array.isArray(dto.institutionTypes) && dto.institutionTypes.length > 0) {
      academy.institutionTypes = dto.institutionTypes;
      academy.institutionType = dto.institutionTypes[0];
    } else if (dto.institutionType) {
      academy.institutionType = dto.institutionType;
      academy.institutionTypes = [dto.institutionType];
    }

    if (Array.isArray(dto.educationBoards) && dto.educationBoards.length > 0) {
      academy.educationBoards = dto.educationBoards;
      academy.educationBoard = dto.educationBoards[0];
    } else if (dto.educationBoard) {
      academy.educationBoard = dto.educationBoard;
      academy.educationBoards = [dto.educationBoard];
    }

    await academy.save();
    return academy;
  }

  /**
   * Master Admin Offline Academy Tenant Registration
   */
  async registerOfflineAcademy(
    dto: {
      name: string;
      slug: string;
      adminName: string;
      adminEmail: string;
      adminPassword?: string;
      phone?: string;
      logoUrl?: string;
      directorSignatureUrl?: string;
      primaryColor?: string;
      institutionType?: string;
      institutionTypes?: string[];
      educationBoard?: string;
      educationBoards?: string[];
      plan?: string;
      subscriptionStatus?: string;
      paymentMode?: string;
      paymentReference?: string;
    },
    platformUserId: string,
  ) {
    const cleanSlug = dto.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    const cleanEmail = dto.adminEmail.toLowerCase().trim();

    if (!cleanSlug || cleanSlug === 'admin' || cleanSlug === 'www') {
      throw new BadRequestException('Invalid or reserved subdomain slug');
    }

    const existingSlug = await this.academyModel.findOne({ slug: cleanSlug }).exec();
    if (existingSlug) {
      throw new BadRequestException(`Subdomain ${cleanSlug}.educare.prohitcoretech.com is already registered`);
    }

    const isTrialPlan = dto.plan === 'TRIAL' || dto.plan === 'TRIAL_14' || dto.subscriptionStatus === 'TRIAL';
    const status = isTrialPlan ? 'TRIAL' : (dto.subscriptionStatus || 'ACTIVE');
    const subEndsAt = new Date();
    subEndsAt.setFullYear(subEndsAt.getFullYear() + 1);

    const rawTypes: string[] = Array.isArray(dto.institutionTypes) && dto.institutionTypes.length > 0
      ? dto.institutionTypes
      : dto.institutionType
      ? [dto.institutionType]
      : ['High School'];

    const rawBoards: string[] = Array.isArray(dto.educationBoards) && dto.educationBoards.length > 0
      ? dto.educationBoards
      : dto.educationBoard
      ? [dto.educationBoard]
      : ['SSC / State Board'];

    const academy = await this.academyModel.create({
      name: dto.name.trim(),
      slug: cleanSlug,
      logoUrl: dto.logoUrl ? dto.logoUrl.trim() : '',
      directorName: dto.adminName.trim(),
      directorSignatureUrl: dto.directorSignatureUrl ? dto.directorSignatureUrl.trim() : '',
      email: cleanEmail,
      phone: dto.phone || '',
      primaryColor: dto.primaryColor || '#f97316',
      institutionType: rawTypes[0],
      institutionTypes: rawTypes,
      educationBoard: rawBoards[0],
      educationBoards: rawBoards,
      subscriptionStatus: status,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      subscriptionEndsAt: status === 'ACTIVE' ? subEndsAt : undefined,
    });

    const rawPassword = dto.adminPassword || 'Academy123!';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const superAdminUser = await this.userModel.create({
      academyId: academy._id,
      name: dto.adminName.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'SUPER_ADMIN',
      phone: dto.phone,
      isActive: true,
    });

    await this.platformAuditLogModel.create({
      platformUserId: new Types.ObjectId(platformUserId),
      academyId: academy._id,
      action: 'OFFLINE_TENANT_REGISTERED',
      details: {
        academyName: academy.name,
        academySlug: academy.slug,
        plan: isTrialPlan ? '14-Day Trial' : (dto.plan || 'PROFESSIONAL'),
        amount: isTrialPlan ? 0 : dto.plan === 'STARTER' ? 11988 : dto.plan === 'ENTERPRISE' ? 95988 : 35988,
        paymentMode: isTrialPlan ? '14_DAY_FREE_TRIAL' : (dto.paymentMode || 'OFFLINE_CASH'),
        paymentReference: dto.paymentReference || (isTrialPlan ? '14-Day Free Trial Activated' : 'N/A'),
      },
    });

    return {
      message: `Offline Academy ${academy.name} provisioned successfully!`,
      academy,
      superAdmin: {
        id: superAdminUser._id,
        name: superAdminUser.name,
        email: superAdminUser.email,
        temporaryPassword: rawPassword,
      },
    };
  }

  /**
   * Master Admin cross-tenant record inspector
   * Returns a complete data dump of all records for any target tenant
   */
  async getTenantFullRecords(academyId: string) {
    const academy = await this.academyModel.findById(academyId).exec();
    if (!academy) throw new NotFoundException('Academy not found');

    const [staffUsers, classBatches, students, payments, feeSchedules] = await Promise.all([
      this.userModel.find({ academyId: academy._id }).select('-passwordHash').exec(),
      this.classBatchModel.find({ academyId: academy._id }).exec(),
      this.studentModel.find({ academyId: academy._id }).exec(),
      this.paymentModel.find({ academyId: academy._id }).sort({ paymentDate: -1 }).exec(),
      this.feeScheduleModel.find({ academyId: academy._id }).exec(),
    ]);

    const totalBilled = feeSchedules.reduce((acc, s) => acc + s.amount, 0);
    const totalCollected = payments.reduce((acc, p) => acc + p.totalAmountPaid, 0);
    const pendingBalance = Math.max(0, totalBilled - totalCollected);

    return {
      academy,
      summary: {
        totalStaff: staffUsers.length,
        totalBatches: classBatches.length,
        totalStudents: students.length,
        totalPaymentsRecorded: payments.length,
        totalBilled,
        totalCollected,
        pendingBalance,
      },
      staffUsers,
      classBatches,
      students,
      payments,
      feeSchedules,
    };
  }

  async impersonateAcademy(platformUserId: string, academyId: string) {
    const academy = await this.academyModel.findById(academyId).exec();
    if (!academy) {
      throw new NotFoundException('Academy not found');
    }

    const superAdmin = await this.userModel.findOne({ academyId: academy._id, role: 'SUPER_ADMIN' }).exec();

    await this.platformAuditLogModel.create({
      platformUserId: new Types.ObjectId(platformUserId),
      academyId: academy._id,
      action: 'IMPERSONATE_START',
      details: { academyName: academy.name, academySlug: academy.slug },
    });

    const payload = {
      sub: superAdmin ? superAdmin._id.toString() : 'impersonated_admin',
      academyId: academy._id.toString(),
      role: 'SUPER_ADMIN',
      email: superAdmin ? superAdmin.email : `admin@${academy.slug}.com`,
      isImpersonating: true,
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'super-secret-key-123',
      expiresIn: '2h',
    });

    return {
      message: `Impersonation token generated for ${academy.name}`,
      token,
      academy: {
        id: academy._id,
        name: academy.name,
        slug: academy.slug,
      },
    };
  }
}
