import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { FeeEngineService } from './fee-engine.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';
import { SubscriptionActiveGuard } from '../../common/guards/subscription-active.guard';

@UseGuards(AcademyAuthGuard, SubscriptionActiveGuard)
@Controller('fee-engine')
export class FeeEngineController {
  constructor(private readonly feeEngineService: FeeEngineService) {}

  @Post('structures')
  async createFeeStructure(@Body() body: { standard: number; medium?: string; stream?: string; name: string; totalAmount: number; installmentsCount: number; startDate?: Date }) {
    return this.feeEngineService.createFeeStructure(body);
  }

  @Get('structures')
  async getFeeStructures() {
    return this.feeEngineService.getFeeStructures();
  }

  @Put('structures/:id')
  async updateFeeStructure(
    @Param('id') id: string,
    @Body() body: { standard?: number; medium?: string; stream?: string; name?: string; totalAmount?: number; installmentsCount?: number; startDate?: Date },
  ) {
    return this.feeEngineService.updateFeeStructure(id, body);
  }

  @Delete('structures/:id')
  async deleteFeeStructure(@Param('id') id: string) {
    return this.feeEngineService.deleteFeeStructure(id);
  }

  @Post('assign-structure')
  async assignFeeStructure(
    @Body() body: { studentId: string; feeStructureId?: string; standard?: number; discountAmount?: number; paymentType?: 'FULL' | 'INSTALLMENT'; installmentCount?: number; customTotalFee?: number },
  ) {
    if (body.feeStructureId) {
      return this.feeEngineService.assignFeeStructureToStudent(body.studentId, body.feeStructureId);
    }
    return this.feeEngineService.assignCustomFeeToStudent({
      studentId: body.studentId,
      standard: body.standard || 10,
      discountAmount: body.discountAmount || 0,
      paymentType: body.paymentType || 'FULL',
      installmentCount: body.installmentCount || 1,
      customTotalFee: body.customTotalFee,
    });
  }

  @Post('initialize-student-fee')
  async initializeStudentFee(
    @Body() body: { studentId: string; standard?: number; discountAmount?: number; paymentType?: 'FULL' | 'INSTALLMENT'; installmentCount?: number; customTotalFee?: number },
  ) {
    return this.assignFeeStructure(body);
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
