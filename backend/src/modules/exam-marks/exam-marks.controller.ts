import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ExamMarksService } from './exam-marks.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';
import { SubscriptionActiveGuard } from '../../common/guards/subscription-active.guard';

@UseGuards(AcademyAuthGuard, SubscriptionActiveGuard)
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
}
