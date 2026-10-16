import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
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
import { SubscriptionPlan, SubscriptionPlanDocument } from '../../database/schemas/subscription-plan.schema';
import { Coupon, CouponDocument } from '../../database/schemas/coupon.schema';
import { PlatformSetting, PlatformSettingDocument } from '../../database/schemas/platform-setting.schema';
import { isValidMobile } from '../../common/utils/phone-validation.util';
import { getStudentLimitByPlan } from '../../common/utils/subscription-plan.util';

@Injectable()
export class PlatformService implements OnModuleInit {
  private readonly logger = new Logger(PlatformService.name);

  constructor(
    @InjectModel(PlatformUser.name) private platformUserModel: Model<PlatformUserDocument>,
    @InjectModel(PlatformAuditLog.name) private platformAuditLogModel: Model<PlatformAuditLogDocument>,
    @InjectModel(Academy.name) private academyModel: Model<AcademyDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(FeeSchedule.name) private feeScheduleModel: Model<FeeScheduleDocument>,
    @InjectModel(ClassBatch.name) private classBatchModel: Model<ClassBatchDocument>,
    @InjectModel(SubscriptionPlan.name) private subscriptionPlanModel: Model<SubscriptionPlanDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(PlatformSetting.name) private platformSettingModel: Model<PlatformSettingDocument>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultPlansAndSettings();
  }

  /**
   * Initializes default subscription plans, sample coupon, and promo banner if not present
   */
  async seedDefaultPlansAndSettings() {
    try {
      const planCount = await this.subscriptionPlanModel.countDocuments();
      if (planCount === 0) {
        this.logger.log('Seeding default monthly subscription plans...');
        await this.subscriptionPlanModel.create([
          {
            name: 'Starter Tier',
            slug: 'STARTER',
            priceMonthly: 999,
            originalPrice: 1499,
            offerBadge: 'Save 33%',
            studentLimit: 'Up to 400 Students',
            maxStudents: 400,
            maxBranches: 2,
            description: 'Perfect for local coaching classes & independent single-branch academies.',
            features: [
              'Up to 1 Branch + Main Branch (Total 2 Branches)',
              'Atomic FIFO Fee Engine',
              'Student Roster & Contact Profiles (Up to 400)',
              'Basic Financial & Fee Reports',
              'Digital Canvas Receipt Generation',
              'Printable Student ID Card PDF',
              'Standard Subdomain',
              'Standard Email Support',
            ],
            popular: false,
            isActive: true,
            sortOrder: 1,
          },
          {
            name: 'Professional Tier',
            slug: 'PROFESSIONAL',
            priceMonthly: 2999,
            originalPrice: 3999,
            offerBadge: 'Most Popular',
            studentLimit: 'Up to 1,500 Students',
            maxStudents: 1500,
            maxBranches: 6,
            description: 'Ideal for growing academies needing full academic batch management & analytics.',
            features: [
              'All Starter Tier Features (Up to 1,500 Students)',
              'Up to 5 Branches + Main Branch (Total 6 Branches)',
              'Academics & Batch Stream Locks (Science/Commerce/Arts)',
              'Multiple Batch Schedules (Morning/Afternoon)',
              'Advance Credit Balance Auto-Settlement',
              'Instant WhatsApp Receipt Sharing',
              'Custom Primary Brand Color & Logo',
              'Audit-Ready Financial Statements PDF',
              'Priority WhatsApp & Phone Support',
            ],
            popular: true,
            isActive: true,
            sortOrder: 2,
          },
          {
            name: 'Enterprise Tier',
            slug: 'ENTERPRISE',
            priceMonthly: 7999,
            originalPrice: 9999,
            offerBadge: 'Full Scalability',
            studentLimit: 'Unlimited Students',
            maxStudents: -1,
            maxBranches: 13,
            description: 'For large educational chains requiring custom domain aliases & master admin inspection.',
            features: [
              'All Professional Tier Features (Unlimited Students)',
              'Up to 12 Branches + Main Branch (Total 13 Branches)',
              'Multi-Branch Scoping & Consolidated Reports',
              'Platform Admin Master Console',
              'Custom Subdomain & Primary Color Branding',
              'Dedicated Account Manager & 24/7 SLA Support',
              'Raw Data Export & Bulk Imports',
            ],
            popular: false,
            isActive: true,
            sortOrder: 3,
          },
        ]);
        this.logger.log('Default monthly subscription plans seeded.');
      }

      const couponCount = await this.couponModel.countDocuments();
      if (couponCount === 0) {
        this.logger.log('Seeding default launch coupon...');
        const oneYearExpiry = new Date();
        oneYearExpiry.setFullYear(oneYearExpiry.getFullYear() + 1);
        await this.couponModel.create({
          code: 'WELCOME20',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          minOrderAmount: 0,
          maxDiscountAmount: 1000,
          applicablePlans: ['ALL'],
          validFrom: new Date(),
          validUntil: oneYearExpiry,
          usageLimit: 500,
          timesUsed: 0,
          isActive: true,
          description: 'Welcome Launch Offer - 20% OFF on all monthly plans!',
        });
      }

      const bannerSetting = await this.platformSettingModel.findOne({ key: 'PROMOTIONAL_BANNER' }).exec();
      if (!bannerSetting) {
        await this.platformSettingModel.create({
          key: 'PROMOTIONAL_BANNER',
          value: {
            isEnabled: true,
            text: 'Special Monthly Launch Offer: Get 20% OFF using coupon code WELCOME20 at checkout!',
            couponCode: 'WELCOME20',
            badgeText: 'LIMITED OFFER',
          },
        });
      }
    } catch (err: any) {
      this.logger.warn(`Could not seed default plans/settings: ${err.message}`);
    }
  }

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
            plan: isTrial ? 'TRIAL_14_DAYS' : (academy.subscriptionPlanKey || 'PROFESSIONAL'),
            amount: isTrial ? 0 : 2999,
            paymentMode: isTrial ? 'FREE_TRIAL' : 'OFFLINE_CASH',
            subscriptionStart: academy.createdAt,
            subscriptionExpiry:
              academy.subscriptionStatus === 'ACTIVE'
                ? academy.subscriptionEndsAt || new Date(new Date(academy.createdAt).setMonth(new Date(academy.createdAt).getMonth() + 1))
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
      subEndsAt.setMonth(subEndsAt.getMonth() + 1);
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

    const isTrialPlan =
      dto.plan === 'TRIAL' ||
      dto.plan === 'TRIAL_14' ||
      dto.plan === '14_DAY_FREE_TRIAL' ||
      dto.subscriptionStatus === 'TRIAL' ||
      dto.paymentMode === 'OFFLINE_TRIAL' ||
      dto.paymentMode === '14_DAY_FREE_TRIAL' ||
      dto.paymentMode === 'FREE_TRIAL';

    const status = isTrialPlan ? 'TRIAL' : (dto.subscriptionStatus || 'ACTIVE');
    const subEndsAt = new Date();
    subEndsAt.setMonth(subEndsAt.getMonth() + 1);

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

    const planKey = dto.plan?.toUpperCase().trim() || 'PROFESSIONAL';

    let planMonthlyAmount = 2999;
    if (dto.plan) {
      const planDoc = await this.subscriptionPlanModel.findOne({ slug: planKey }).exec();
      if (planDoc) {
        planMonthlyAmount = planDoc.priceMonthly;
      } else if (planKey === 'STARTER') {
        planMonthlyAmount = 999;
      } else if (planKey === 'ENTERPRISE') {
        planMonthlyAmount = 7999;
      }
    }

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
      subscriptionPlanKey: isTrialPlan ? 'TRIAL' : planKey,
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
        plan: isTrialPlan ? '14-Day Free Trial' : `${planKey} (Monthly)`,
        amount: isTrialPlan ? 0 : planMonthlyAmount,
        paymentMode: isTrialPlan ? '14_DAY_FREE_TRIAL' : (dto.paymentMode || 'OFFLINE_CASH'),
        paymentReference: dto.paymentReference || (isTrialPlan ? '14-Day Free Trial Activated' : 'N/A'),
        subscriptionStart: academy.createdAt || new Date(),
        subscriptionExpiry: isTrialPlan ? academy.trialEndsAt : academy.subscriptionEndsAt,
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

  async bulkImportStudents(
    platformUserId: string,
    academyId: string,
    rows: Array<{
      name: string;
      parentName: string;
      parentPhone: string;
      parentEmail?: string;
      standard: number;
      medium?: string;
      stream?: string;
      rollNo?: string;
      dateOfBirth?: string;
      bloodGroup?: string;
      address?: string;
      emergencyPhone?: string;
      customTotalFee?: number;
    }>,
  ) {
    const academy = await this.academyModel.findById(academyId).exec();
    if (!academy) {
      throw new NotFoundException('Academy tenant not found');
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestException('No student records provided for bulk import');
    }

    const currentYear = new Date().getFullYear();
    let existingCount = await this.studentModel.countDocuments({ academyId: academy._id });
    const planKey = (academy as any)?.subscriptionPlanKey || (academy.subscriptionStatus === 'TRIAL' ? 'TRIAL' : 'STARTER');
    const studentLimit = getStudentLimitByPlan(planKey);

    if (studentLimit !== -1 && existingCount >= studentLimit) {
      throw new BadRequestException(`Student capacity limit reached for ${academy.name} (${existingCount}/${studentLimit}). Upgrade subscription plan to import more students.`);
    }

    const importedStudents: any[] = [];
    const errors: string[] = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 1;

      if (existingCount >= studentLimit) {
        errors.push(`Row ${rowNum}: Plan student limit of ${studentLimit} reached for this academy.`);
        continue;
      }

      if (!row.name || !row.name.trim()) {
        errors.push(`Row ${rowNum}: Student Name is required`);
        continue;
      }
      if (!row.parentName || !row.parentName.trim()) {
        errors.push(`Row ${rowNum}: Parent Name is required`);
        continue;
      }
      if (!row.parentPhone || !isValidMobile(row.parentPhone)) {
        errors.push(`Row ${rowNum}: Parent Phone must be a valid 10-digit mobile number starting with 6-9`);
        continue;
      }
      if (row.emergencyPhone && !isValidMobile(row.emergencyPhone)) {
        errors.push(`Row ${rowNum}: Emergency Phone must be a valid 10-digit mobile number starting with 6-9`);
        continue;
      }

      const std = Number(row.standard) || 10;
      if (std < 1 || std > 15) {
        errors.push(`Row ${rowNum}: Standard must be a number between 1 and 15`);
        continue;
      }

      const medium = (row.medium || (std >= 11 ? 'english' : 'english')).toLowerCase().trim();
      const stream = (row.stream || (std >= 11 ? 'science' : 'none')).toLowerCase().trim();

      // Find or create matching ClassBatch
      let classBatch = await this.classBatchModel.findOne({
        academyId: academy._id,
        standard: std,
        medium,
      }).exec();

      if (!classBatch) {
        const batchName = std >= 11 
          ? `Class ${std}th Standard (${stream.toUpperCase()})` 
          : `Class ${std}th Standard (${medium.toUpperCase()})`;
        classBatch = await this.classBatchModel.create({
          academyId: academy._id,
          standard: std,
          medium,
          section: std >= 11 ? stream : 'none',
          batchName,
        });
      }

      existingCount++;
      const seqNumber = String(existingCount).padStart(5, '0');
      const studentCode = `STU-${currentYear}-${seqNumber}`;

      const totalFee = Number(row.customTotalFee) || (std >= 11 ? 45000 : 35000);

      const student = await this.studentModel.create({
        academyId: academy._id,
        studentCode,
        name: row.name.trim(),
        parentName: row.parentName.trim(),
        parentPhone: row.parentPhone.trim(),
        parentEmail: row.parentEmail ? row.parentEmail.trim() : undefined,
        classBatchId: classBatch._id,
        standard: std,
        medium,
        stream,
        customTotalFee: totalFee,
        discountAmount: 0,
        paymentType: 'FULL',
        installmentCount: 1,
        dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
        bloodGroup: row.bloodGroup || 'B+',
        emergencyContactName: row.parentName.trim(),
        emergencyPhone: row.emergencyPhone ? row.emergencyPhone.trim() : row.parentPhone.trim(),
        address: row.address || '',
        rollNo: row.rollNo || studentCode,
        validUpto: `31-MAR-${currentYear + 1}`,
        status: 'ACTIVE',
        advanceBalance: 0,
      });

      // Create FeeSchedule
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      await this.feeScheduleModel.create({
        academyId: academy._id,
        studentId: student._id,
        installmentNo: 1,
        amount: totalFee,
        dueDate,
        status: 'PENDING',
        paidAmount: 0,
      });

      importedStudents.push(student);
    }

    await this.platformAuditLogModel.create({
      platformUserId: new Types.ObjectId(platformUserId),
      academyId: academy._id,
      action: 'BULK_STUDENT_IMPORT',
      details: {
        academyName: academy.name,
        attemptedCount: rows.length,
        importedCount: importedStudents.length,
        errorCount: errors.length,
      },
    });

    return {
      message: `Successfully imported ${importedStudents.length} of ${rows.length} students into ${academy.name}`,
      importedCount: importedStudents.length,
      totalAttempted: rows.length,
      errors,
    };
  }

  /**
   * Extends the trial period for a target tenant academy by specified days (default 14 days)
   * Allowed only via Master Admin Console
   */
  async extendTrialPeriod(id: string, days: number = 14, platformUserId: string) {
    const academy = await this.academyModel.findById(id).exec();
    if (!academy) throw new NotFoundException('Academy tenant not found');

    const extendDays = Number(days) > 0 ? Number(days) : 14;

    // Calculate base date: if current trialEndsAt is in the future, extend from that; otherwise extend from current date
    const baseDate = (academy.trialEndsAt && new Date(academy.trialEndsAt).getTime() > Date.now())
      ? new Date(academy.trialEndsAt)
      : new Date();

    const newTrialEndsAt = new Date(baseDate.getTime() + extendDays * 24 * 60 * 60 * 1000);
    academy.trialEndsAt = newTrialEndsAt;

    // If tenant subscription is not ACTIVE, set status to TRIAL
    if (academy.subscriptionStatus !== 'ACTIVE') {
      academy.subscriptionStatus = 'TRIAL';
    }

    await academy.save();

    // Log transaction/audit event
    await this.platformAuditLogModel.create({
      platformUserId: new Types.ObjectId(platformUserId),
      academyId: academy._id,
      action: 'TRIAL_EXTENDED_14_DAYS',
      details: {
        academyName: academy.name,
        academySlug: academy.slug,
        extendedDays: extendDays,
        newTrialEndsAt,
        subscriptionStart: academy.createdAt,
        subscriptionExpiry: newTrialEndsAt,
        paymentMode: '14_DAY_FREE_TRIAL',
        amount: 0,
      },
    });

    return {
      message: `Trial period successfully extended by ${extendDays} days for ${academy.name}! New Trial Expiry: ${newTrialEndsAt.toLocaleDateString('en-IN')}`,
      academy,
    };
  }

  // ==========================================
  // DYNAMIC PRICING & SUBSCRIPTION PLANS
  // ==========================================

  async getPublicPlans() {
    return this.subscriptionPlanModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, priceMonthly: 1 })
      .exec();
  }

  async getAllPlans() {
    return this.subscriptionPlanModel
      .find()
      .sort({ sortOrder: 1, priceMonthly: 1 })
      .exec();
  }

  async createPlan(dto: Partial<SubscriptionPlan>) {
    if (!dto.name || !dto.slug || dto.priceMonthly === undefined) {
      throw new BadRequestException('Plan name, slug, and monthly price are required');
    }
    const cleanSlug = dto.slug.toUpperCase().trim();
    const existing = await this.subscriptionPlanModel.findOne({ slug: cleanSlug }).exec();
    if (existing) {
      throw new BadRequestException(`Plan with slug '${cleanSlug}' already exists`);
    }

    return this.subscriptionPlanModel.create({
      ...dto,
      slug: cleanSlug,
      priceMonthly: Number(dto.priceMonthly),
      originalPrice: dto.originalPrice ? Number(dto.originalPrice) : undefined,
      maxStudents: dto.maxStudents !== undefined ? Number(dto.maxStudents) : 400,
      maxBranches: dto.maxBranches !== undefined ? Number(dto.maxBranches) : 2,
      features: Array.isArray(dto.features) ? dto.features : [],
      popular: Boolean(dto.popular),
      isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
      sortOrder: dto.sortOrder !== undefined ? Number(dto.sortOrder) : 0,
    });
  }

  async updatePlan(id: string, dto: Partial<SubscriptionPlan>) {
    const plan = await this.subscriptionPlanModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Subscription plan not found');

    if (dto.name !== undefined) plan.name = dto.name;
    if (dto.priceMonthly !== undefined) plan.priceMonthly = Number(dto.priceMonthly);
    if (dto.originalPrice !== undefined) plan.originalPrice = Number(dto.originalPrice);
    if (dto.offerBadge !== undefined) plan.offerBadge = dto.offerBadge;
    if (dto.studentLimit !== undefined) plan.studentLimit = dto.studentLimit;
    if (dto.maxStudents !== undefined) plan.maxStudents = Number(dto.maxStudents);
    if (dto.maxBranches !== undefined) plan.maxBranches = Number(dto.maxBranches);
    if (dto.description !== undefined) plan.description = dto.description;
    if (dto.features !== undefined) plan.features = dto.features;
    if (dto.popular !== undefined) plan.popular = Boolean(dto.popular);
    if (dto.isActive !== undefined) plan.isActive = Boolean(dto.isActive);
    if (dto.sortOrder !== undefined) plan.sortOrder = Number(dto.sortOrder);

    await plan.save();
    return plan;
  }

  async deletePlan(id: string) {
    const plan = await this.subscriptionPlanModel.findById(id).exec();
    if (!plan) throw new NotFoundException('Subscription plan not found');
    await this.subscriptionPlanModel.findByIdAndDelete(id).exec();
    return { message: 'Plan deleted successfully', id };
  }

  // ==========================================
  // COUPONS & DISCOUNTS MANAGEMENT
  // ==========================================

  async getAllCoupons() {
    return this.couponModel.find().sort({ createdAt: -1 }).exec();
  }

  async createCoupon(dto: Partial<Coupon>) {
    if (!dto.code || dto.discountValue === undefined) {
      throw new BadRequestException('Coupon code and discount value are required');
    }
    const cleanCode = dto.code.toUpperCase().trim();
    const existing = await this.couponModel.findOne({ code: cleanCode }).exec();
    if (existing) {
      throw new BadRequestException(`Coupon code '${cleanCode}' already exists`);
    }

    return this.couponModel.create({
      ...dto,
      code: cleanCode,
      discountType: dto.discountType || 'PERCENTAGE',
      discountValue: Number(dto.discountValue),
      minOrderAmount: dto.minOrderAmount ? Number(dto.minOrderAmount) : 0,
      maxDiscountAmount: dto.maxDiscountAmount ? Number(dto.maxDiscountAmount) : undefined,
      usageLimit: dto.usageLimit ? Number(dto.usageLimit) : undefined,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : new Date(),
      validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
      isActive: dto.isActive !== undefined ? Boolean(dto.isActive) : true,
      applicablePlans: Array.isArray(dto.applicablePlans) && dto.applicablePlans.length > 0 ? dto.applicablePlans : ['ALL'],
    });
  }

  async updateCoupon(id: string, dto: Partial<Coupon>) {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');

    if (dto.discountValue !== undefined) coupon.discountValue = Number(dto.discountValue);
    if (dto.discountType !== undefined) coupon.discountType = dto.discountType;
    if (dto.minOrderAmount !== undefined) coupon.minOrderAmount = Number(dto.minOrderAmount);
    if (dto.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = Number(dto.maxDiscountAmount);
    if (dto.usageLimit !== undefined) coupon.usageLimit = Number(dto.usageLimit);
    if (dto.validUntil !== undefined) coupon.validUntil = dto.validUntil ? new Date(dto.validUntil) : undefined;
    if (dto.isActive !== undefined) coupon.isActive = Boolean(dto.isActive);
    if (dto.description !== undefined) coupon.description = dto.description;
    if (dto.applicablePlans !== undefined) coupon.applicablePlans = dto.applicablePlans;

    await coupon.save();
    return coupon;
  }

  async deleteCoupon(id: string) {
    const coupon = await this.couponModel.findById(id).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    await this.couponModel.findByIdAndDelete(id).exec();
    return { message: 'Coupon deleted successfully', id };
  }

  // ==========================================
  // PROMOTIONAL BANNER & ANNOUNCEMENTS
  // ==========================================

  async getPublicBanner() {
    const setting = await this.platformSettingModel.findOne({ key: 'PROMOTIONAL_BANNER' }).exec();
    if (!setting || !setting.value || !setting.value.isEnabled) {
      return { isEnabled: false };
    }
    return setting.value;
  }

  async getBannerSettings() {
    const setting = await this.platformSettingModel.findOne({ key: 'PROMOTIONAL_BANNER' }).exec();
    return setting?.value || { isEnabled: false, text: '', couponCode: '', badgeText: '' };
  }

  async updateBannerSettings(value: any) {
    const updated = await this.platformSettingModel.findOneAndUpdate(
      { key: 'PROMOTIONAL_BANNER' },
      { key: 'PROMOTIONAL_BANNER', value },
      { upsert: true, new: true },
    ).exec();
    return updated.value;
  }
}

