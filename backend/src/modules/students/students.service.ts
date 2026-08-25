import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Student, StudentDocument } from '../../database/schemas/student.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { FeeEngineService } from '../fee-engine/fee-engine.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
    private tenantContextService: TenantContextService,
    private feeEngineService: FeeEngineService,
  ) {}

  async create(dto: {
    name: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    classBatchId: string;
    standard: number;
    medium?: string;
    stream?: string;
    dateOfBirth?: Date;
    discountAmount?: number;
    paymentType?: 'FULL' | 'INSTALLMENT';
    installmentCount?: number;
    customTotalFee?: number;
  }) {
    const academyId = this.tenantContextService.academyId;
    const count = await this.studentModel.countDocuments({ academyId });
    const studentCode = `STU-${(count + 1).toString().padStart(4, '0')}`;

    const student = await this.studentModel.create({
      academyId,
      studentCode,
      name: dto.name,
      parentName: dto.parentName,
      parentPhone: dto.parentPhone,
      parentEmail: dto.parentEmail,
      classBatchId: new Types.ObjectId(dto.classBatchId),
      standard: dto.standard,
      medium: dto.medium || (dto.standard >= 11 ? 'english' : 'english'),
      stream: dto.stream || (dto.standard >= 11 ? 'science' : 'none'),
      dateOfBirth: dto.dateOfBirth,
      status: 'ACTIVE',
      advanceBalance: 0,
    });

    try {
      await this.feeEngineService.assignCustomFeeToStudent({
        studentId: student._id.toString(),
        standard: dto.standard,
        discountAmount: dto.discountAmount || 0,
        paymentType: dto.paymentType || 'FULL',
        installmentCount: dto.paymentType === 'INSTALLMENT' ? (dto.installmentCount || 3) : 1,
        customTotalFee: dto.customTotalFee,
      });
    } catch (e) {
      // Non-fatal fee assignment fallback
    }

    return student;
  }

  async findAll() {
    const academyId = this.tenantContextService.academyId;
    return this.studentModel.find({ academyId }).populate('classBatchId').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const academyId = this.tenantContextService.academyId;
    const student = await this.studentModel.findOne({ _id: id, academyId }).populate('classBatchId').exec();
    if (!student) throw new NotFoundException('Student not found or does not belong to this tenant');
    return student;
  }

  async update(id: string, dto: Partial<Student>) {
    const academyId = this.tenantContextService.academyId;
    const updated = await this.studentModel
      .findOneAndUpdate({ _id: id, academyId }, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException('Student not found or cross-tenant update rejected');
    return updated;
  }

  async remove(id: string) {
    const academyId = this.tenantContextService.academyId;
    const res = await this.studentModel.deleteOne({ _id: id, academyId }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Student not found or cross-tenant deletion rejected');
    return { message: 'Student deleted successfully' };
  }
}
