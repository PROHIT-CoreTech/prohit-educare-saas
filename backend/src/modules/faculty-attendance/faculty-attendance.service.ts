import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FacultyAttendance, FacultyAttendanceDocument } from '../../database/schemas/faculty-attendance.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Injectable()
export class FacultyAttendanceService {
  constructor(
    @InjectModel(FacultyAttendance.name) private facultyAttendanceModel: Model<FacultyAttendanceDocument>,
    private tenantContextService: TenantContextService,
  ) {}

  async getAttendanceByDate(dateStr: string) {
    const academyId = this.tenantContextService.academyId;
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    return this.facultyAttendanceModel
      .find({
        academyId,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .populate('facultyId', 'name subject phone status assignedStandards')
      .populate('substituteFacultyId', 'name subject phone')
      .exec();
  }

  async markAttendance(dto: {
    date: string;
    facultyId: string;
    status: 'PRESENT' | 'ABSENT' | 'SUBSTITUTED';
    substituteFacultyId?: string;
    slots?: string[];
    notes?: string;
  }) {
    const academyId = this.tenantContextService.academyId;
    const targetDate = new Date(dto.date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));

    const facultyObjectId = new Types.ObjectId(dto.facultyId);
    const substituteObjectId = dto.substituteFacultyId ? new Types.ObjectId(dto.substituteFacultyId) : undefined;

    return this.facultyAttendanceModel.findOneAndUpdate(
      {
        academyId,
        facultyId: facultyObjectId,
        date: startOfDay,
      },
      {
        academyId,
        facultyId: facultyObjectId,
        date: startOfDay,
        status: dto.status,
        substituteFacultyId: substituteObjectId,
        slots: dto.slots || [],
        notes: dto.notes || '',
      },
      { upsert: true, new: true },
    );
  }

  async batchMarkAttendance(dto: {
    date: string;
    records: Array<{
      facultyId: string;
      status: 'PRESENT' | 'ABSENT' | 'SUBSTITUTED';
      substituteFacultyId?: string;
      slots?: string[];
      notes?: string;
    }>;
  }) {
    const results = [];
    for (const rec of dto.records) {
      const saved = await this.markAttendance({
        date: dto.date,
        facultyId: rec.facultyId,
        status: rec.status,
        substituteFacultyId: rec.substituteFacultyId,
        slots: rec.slots,
        notes: rec.notes,
      });
      results.push(saved);
    }
    return results;
  }
}
