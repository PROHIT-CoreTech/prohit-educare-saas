import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { RosterService } from './roster.service';
import { AcademyAuthGuard } from '../../common/guards/academy-auth.guard';
import { SubscriptionActiveGuard } from '../../common/guards/subscription-active.guard';

@UseGuards(AcademyAuthGuard, SubscriptionActiveGuard)
@Controller('roster')
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}

  @Get()
  getWeeklyRoster() {
    return this.rosterService.getWeeklyRoster();
  }

  @Get('today')
  getTodayRoster(@Query('day') day?: string) {
    const defaultDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return this.rosterService.getTodayRoster(day || defaultDay);
  }

  @Post('upsert')
  upsertRoster(@Body() body: { facultyId: string; weeklySchedule: { day: string; slots: string[] }[] }) {
    return this.rosterService.upsertRoster(body);
  }
}
