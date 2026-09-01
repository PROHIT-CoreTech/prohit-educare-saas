import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Roster, RosterDocument } from '../../database/schemas/roster.schema';
import { Faculty, FacultyDocument } from '../../database/schemas/faculty.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Injectable()
export class RosterService {
  constructor(
    @InjectModel(Roster.name) private rosterModel: Model<RosterDocument>,
    @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
    private tenantContextService: TenantContextService,
  ) {}

  async getWeeklyRoster() {
    const academyId = this.tenantContextService.academyId;
    const rosters = await this.rosterModel
      .find({ academyId })
      .populate('facultyId', 'name subject phone status assignedStandards')
      .exec();

    const facultyList = await this.facultyModel.find({ academyId, status: 'ACTIVE' }).exec();

    // Map roster items by facultyId for easy lookup
    const rosterMap = new Map();
    rosters.forEach((r) => {
      if (r.facultyId) {
        rosterMap.set(r.facultyId._id.toString(), r);
      }
    });

    // Ensure all active faculty have a roster representation
    return facultyList.map((faculty) => {
      const existing = rosterMap.get(faculty._id.toString());
      return {
        faculty,
        weeklySchedule: existing
          ? existing.weeklySchedule
          : [
              { day: 'Monday', slots: [] },
              { day: 'Tuesday', slots: [] },
              { day: 'Wednesday', slots: [] },
              { day: 'Thursday', slots: [] },
              { day: 'Friday', slots: [] },
              { day: 'Saturday', slots: [] },
            ],
      };
    });
  }

  async upsertRoster(dto: { facultyId: string; weeklySchedule: { day: string; slots: string[] }[] }) {
    const academyId = this.tenantContextService.academyId;
    const facultyObjectId = new Types.ObjectId(dto.facultyId);

    const updated = await this.rosterModel.findOneAndUpdate(
      { academyId, facultyId: facultyObjectId },
      {
        academyId,
        facultyId: facultyObjectId,
        weeklySchedule: dto.weeklySchedule,
      },
      { upsert: true, new: true },
    );

    return updated;
  }

  async getTodayRoster(dayName: string) {
    const academyId = this.tenantContextService.academyId;
    const weeklyData = await this.getWeeklyRoster();

    return weeklyData
      .map((item) => {
        const daySched = item.weeklySchedule?.find((s: any) => s.day === dayName);
        return {
          faculty: item.faculty,
          slots: daySched ? daySched.slots : [],
        };
      })
      .filter((item) => item.slots && item.slots.length > 0);
  }
}
