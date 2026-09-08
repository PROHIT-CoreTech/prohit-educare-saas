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
import { isValidMobile } from '../../common/utils/phone-validation.util';
import { getStudentLimitByPlan } from '../../common/utils/subscription-plan.util';

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
        plan: isTrialPlan ? '14-Day Free Trial' : (dto.plan || 'PROFESSIONAL'),
        amount: isTrialPlan ? 0 : dto.plan === 'STARTER' ? 11988 : dto.plan === 'ENTERPRISE' ? 95988 : 35988,
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
}
