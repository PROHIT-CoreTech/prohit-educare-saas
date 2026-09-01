import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Faculty, FacultyDocument } from '../../database/schemas/faculty.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Injectable()
export class FacultyService {
  constructor(
    @InjectModel(Faculty.name) private facultyModel: Model<FacultyDocument>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(dto: {
    name: string;
    phone: string;
    email?: string;
    subject: string;
    qualification?: string;
    facultyId?: string;
    assignedStandards?: string[];
  }) {
    const academyId = this.tenantContextService.academyId;
    const count = await this.facultyModel.countDocuments({ academyId });
    const currentYear = new Date().getFullYear();
    const autoFacultyId = dto.facultyId || `FAC-${currentYear}-${String(count + 1).padStart(3, '0')}`;

    return this.facultyModel.create({
      academyId,
      facultyId: autoFacultyId,
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      subject: dto.subject,
      qualification: dto.qualification,
      assignedStandards: dto.assignedStandards || [],
      status: 'ACTIVE',
    });
  }

  async findAll() {
    const academyId = this.tenantContextService.academyId;
    return this.facultyModel.find({ academyId }).sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    const academyId = this.tenantContextService.academyId;
    const faculty = await this.facultyModel.findOne({ _id: id, academyId }).exec();
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty;
  }

  async update(id: string, dto: Partial<Faculty>) {
    const academyId = this.tenantContextService.academyId;
    const updated = await this.facultyModel
      .findOneAndUpdate({ _id: id, academyId }, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Faculty profile not found');
    return updated;
  }

  async remove(id: string) {
    const academyId = this.tenantContextService.academyId;
    const res = await this.facultyModel.deleteOne({ _id: id, academyId }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Faculty profile not found');
    return { message: 'Faculty profile deleted successfully' };
  }
}
