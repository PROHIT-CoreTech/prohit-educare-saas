import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExamMarksService } from './exam-marks.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';
import { SubscriptionActiveGuard } from '../../common/guards/subscription-active.guard';
import { ExamTierGuard } from '../../common/guards/exam-tier.guard';

@UseGuards(AcademyAuthGuard, SubscriptionActiveGuard, ExamTierGuard)
@Controller('exam-marks')
export class ExamMarksController {
  constructor(private readonly examMarksService: ExamMarksService) {}

  @Post()
  create(@Body() body: any) {
    return this.examMarksService.create(body);
  }

  @Get('student/:studentId')
  getStudentMarks(@Param('studentId') studentId: string) {
    return this.examMarksService.getStudentMarks(studentId);
  }

  @Get('class/:classBatchId')
  getClassMarks(@Param('classBatchId') classBatchId: string, @Query('examName') examName?: string) {
    return this.examMarksService.getClassMarks(classBatchId, examName);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examMarksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.examMarksService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examMarksService.remove(id);
  }
}
