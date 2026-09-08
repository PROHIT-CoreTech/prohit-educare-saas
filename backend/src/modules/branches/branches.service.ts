import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Branch, BranchDocument } from '../../database/schemas/branch.schema';
import { Academy, AcademyDocument } from '../../database/schemas/academy.schema';
import { Student, StudentDocument } from '../../database/schemas/student.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { getBranchLimitByPlan } from '../../common/utils/subscription-plan.util';

@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
    @InjectModel(Academy.name) private academyModel: Model<AcademyDocument>,
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private tenantContextService: TenantContextService,
  ) {}

  /**
   * Auto-ensures Main Branch exists for the academy and returns all branches with student counts.
   */
  async getBranches() {
    const academyId = this.tenantContextService.academyId;
    const academy = await this.academyModel.findById(academyId).exec();
    if (!academy) throw new NotFoundException('Academy tenant not found');

    let branches = await this.branchModel.find({ academyId }).sort({ isMain: -1, createdAt: 1 }).exec();

    // Auto-initialize Main Branch if tenant has no branches
    if (branches.length === 0) {
      const mainBranch = await this.branchModel.create({
        academyId,
        name: `${academy.name} (Main Branch)`,
        code: 'BR-MAIN',
        address: academy.address || 'Main Campus',
        phone: academy.phone || '',
        email: academy.email || '',
        isMain: true,
        status: 'ACTIVE',
      });
      branches = [mainBranch];
    }

    // Attach student count to each branch
    const branchesWithCounts = await Promise.all(
      branches.map(async (b) => {
        const studentCount = await this.studentModel.countDocuments({
          academyId,
          $or: [
            { branchId: b._id },
            ...(b.isMain ? [{ branchId: { $exists: false } }, { branchId: null }] : []),
          ],
        });
        return {
          ...b.toObject(),
          studentCount,
        };
      }),
    );

    return branchesWithCounts;
  }

  /**
   * Returns branch capacity metrics based on active subscription tier.
   */
  async getBranchUsageStats() {
    const academyId = this.tenantContextService.academyId;
    const academy = await this.academyModel.findById(academyId).exec();
    if (!academy) throw new NotFoundException('Academy tenant not found');

    const totalBranches = await this.branchModel.countDocuments({ academyId });
    const planKey = (academy as any)?.subscriptionPlanKey || (academy.subscriptionStatus === 'TRIAL' ? 'TRIAL' : 'STARTER');
    const branchLimit = getBranchLimitByPlan(planKey);
    const remainingBranches = Math.max(0, branchLimit - Math.max(1, totalBranches));

    return {
      totalBranches: Math.max(1, totalBranches),
      branchLimit,
      remainingBranches,
      planKey,
    };
  }

  /**
   * Creates a new branch for the tenant enforcing subscription plan capacity limits.
   */
  async createBranch(dto: { name: string; code: string; address?: string; phone?: string; email?: string }) {
    const academyId = this.tenantContextService.academyId;
    const academy = await this.academyModel.findById(academyId).exec();
    if (!academy) throw new NotFoundException('Academy tenant not found');

    // Ensure main branch exists first
    await this.getBranches();

    const existingCount = await this.branchModel.countDocuments({ academyId });
    const planKey = (academy as any)?.subscriptionPlanKey || (academy.subscriptionStatus === 'TRIAL' ? 'TRIAL' : 'STARTER');
    const branchLimit = getBranchLimitByPlan(planKey);

    if (existingCount >= branchLimit) {
      throw new BadRequestException(
        `Branch limit reached for your ${planKey} plan (${existingCount}/${branchLimit} branches). Upgrade your subscription plan to add more branches.`,
      );
    }

    const cleanCode = dto.code ? dto.code.toUpperCase().trim() : `BR-${Date.now().toString().slice(-4)}`;

    const newBranch = await this.branchModel.create({
      academyId,
      name: dto.name,
      code: cleanCode,
      address: dto.address || '',
      phone: dto.phone || '',
      email: dto.email || '',
      isMain: false,
      status: 'ACTIVE',
    });

    return newBranch;
  }

  /**
   * Updates existing branch details.
   */
  async updateBranch(id: string, dto: { name?: string; code?: string; address?: string; phone?: string; email?: string; status?: string }) {
    const academyId = this.tenantContextService.academyId;
    const branch = await this.branchModel.findOne({ _id: id, academyId }).exec();
    if (!branch) throw new NotFoundException('Branch not found');

    if (dto.name) branch.name = dto.name;
    if (dto.code) branch.code = dto.code.toUpperCase().trim();
    if (dto.address !== undefined) branch.address = dto.address;
    if (dto.phone !== undefined) branch.phone = dto.phone;
    if (dto.email !== undefined) branch.email = dto.email;
    if (dto.status && ['ACTIVE', 'INACTIVE'].includes(dto.status)) {
      if (branch.isMain && dto.status === 'INACTIVE') {
        throw new BadRequestException('Main onboarding branch cannot be deactivated');
      }
      branch.status = dto.status;
    }

    await branch.save();
    return branch;
  }
}
