import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { FeeEngineService } from './fee-engine.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';
import { SubscriptionActiveGuard } from '../../common/guards/subscription-active.guard';

@UseGuards(AcademyAuthGuard, SubscriptionActiveGuard)
@Controller('fee-engine')
export class FeeEngineController {
  constructor(private readonly feeEngineService: FeeEngineService) {}

  @Post('structures')
  async createFeeStructure(@Body() body: { standard: number; name: string; totalAmount: number; installmentsCount: number; startDate?: Date }) {
    return this.feeEngineService.createFeeStructure(body);
  }

  @Get('structures')
  async getFeeStructures() {
    return this.feeEngineService.getFeeStructures();
  }

  @Post('assign-structure')
  async assignFeeStructure(@Body() body: { studentId: string; feeStructureId: string }) {
    return this.feeEngineService.assignFeeStructureToStudent(body.studentId, body.feeStructureId);
  }

  @Post('record-payment')
  async recordPayment(
    @Body() body: { studentId: string; amountPaid: number; paymentMode: string; transactionRef?: string },
  ) {
    return this.feeEngineService.recordPayment(body);
  }

  @Get('student-summary/:studentId')
  async getStudentFeeSummary(@Param('studentId') studentId: string) {
    return this.feeEngineService.getStudentFeeSummary(studentId);
  }
}
