import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';
import { SubscriptionActiveGuard } from '../../common/guards/subscription-active.guard';

@Controller('branches')
@UseGuards(AcademyAuthGuard, SubscriptionActiveGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  async getBranches() {
    return this.branchesService.getBranches();
  }

  @Get('usage-stats')
  async getBranchUsageStats() {
    return this.branchesService.getBranchUsageStats();
  }

  @Post()
  async createBranch(
    @Body() dto: { name: string; code: string; address?: string; phone?: string; email?: string },
  ) {
    return this.branchesService.createBranch(dto);
  }

  @Patch(':id')
  async updateBranch(
    @Param('id') id: string,
    @Body() dto: { name?: string; code?: string; address?: string; phone?: string; email?: string; status?: string },
  ) {
    return this.branchesService.updateBranch(id, dto);
  }
}
