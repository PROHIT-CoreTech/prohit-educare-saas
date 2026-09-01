import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { FacultyAttendanceService } from './faculty-attendance.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';
import { SubscriptionActiveGuard } from '../../common/guards/subscription-active.guard';

@UseGuards(AcademyAuthGuard, SubscriptionActiveGuard)
@Controller('faculty-attendance')
export class FacultyAttendanceController {
  constructor(private readonly facultyAttendanceService: FacultyAttendanceService) {}

  @Get()
  getAttendanceByDate(@Query('date') date?: string) {
    const defaultDate = new Date().toISOString().split('T')[0];
    return this.facultyAttendanceService.getAttendanceByDate(date || defaultDate);
  }

  @Post('mark')
  markAttendance(
    @Body()
    body: {
      date: string;
      facultyId: string;
      status: 'PRESENT' | 'ABSENT' | 'SUBSTITUTED';
      substituteFacultyId?: string;
      slots?: string[];
      notes?: string;
    },
  ) {
    return this.facultyAttendanceService.markAttendance(body);
  }

  @Post('batch-mark')
  batchMarkAttendance(
    @Body()
    body: {
      date: string;
      records: Array<{
        facultyId: string;
        status: 'PRESENT' | 'ABSENT' | 'SUBSTITUTED';
        substituteFacultyId?: string;
        slots?: string[];
        notes?: string;
      }>;
    },
  ) {
    return this.facultyAttendanceService.batchMarkAttendance(body);
  }
}
