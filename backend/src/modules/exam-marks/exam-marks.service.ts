import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExamMark, ExamMarkDocument } from '../../database/schemas/exam-mark.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 35) return 'C';
  return 'F';
}

@Injectable()
export class ExamMarksService {
  constructor(
    @InjectModel(ExamMark.name) private examMarkModel: Model<ExamMarkDocument>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(dto: {
    classBatchId: string;
    studentId: string;
    examName: string;
    examType?: string;
    subject: string;
    marksObtained: number;
    totalMarks: number;
    grade?: string;
    remarks?: string;
    examDate?: string | Date;
  }) {
    const academyId = this.tenantContextService.academyId;

    const marksObtained = Number(dto.marksObtained);
    const totalMarks = Number(dto.totalMarks);

    if (isNaN(marksObtained) || marksObtained < 0) {
      throw new BadRequestException('Marks obtained must be a positive number');
    }
    if (isNaN(totalMarks) || totalMarks <= 0) {
      throw new BadRequestException('Total marks must be greater than 0');
    }
    if (marksObtained > totalMarks) {
      throw new BadRequestException(`Marks obtained (${marksObtained}) cannot exceed total marks (${totalMarks})`);
    }

    const percentage = Math.round(((marksObtained / totalMarks) * 100) * 100) / 100;
    const grade = dto.grade?.trim() ? dto.grade.trim() : calculateGrade(percentage);

    const mark = await this.examMarkModel.create({
      academyId,
      classBatchId: new Types.ObjectId(dto.classBatchId),
      studentId: new Types.ObjectId(dto.studentId),
      examName: dto.examName.trim(),
      examType: dto.examType?.trim() || 'Unit Test',
      subject: dto.subject.trim(),
      marksObtained,
      totalMarks,
      percentage,
      grade,
      remarks: dto.remarks?.trim() || '',
      examDate: dto.examDate ? new Date(dto.examDate) : new Date(),
    });

    return mark;
  }

  async getStudentMarks(studentId: string) {
    const academyId = this.tenantContextService.academyId;
    return this.examMarkModel
      .find({ academyId, studentId: new Types.ObjectId(studentId) })
      .populate('classBatchId')
      .populate('studentId')
      .sort({ examDate: -1, createdAt: -1 })
      .exec();
  }

  async getClassMarks(classBatchId: string, examName?: string) {
    const academyId = this.tenantContextService.academyId;
    const query: any = { academyId, classBatchId: new Types.ObjectId(classBatchId) };
    if (examName) query.examName = examName;

    return this.examMarkModel
      .find(query)
      .populate('studentId')
      .populate('classBatchId')
      .sort({ examDate: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string) {
    const academyId = this.tenantContextService.academyId;
    const mark = await this.examMarkModel
      .findOne({ _id: new Types.ObjectId(id), academyId })
      .populate('studentId')
      .populate('classBatchId')
      .exec();

    if (!mark) {
      throw new NotFoundException('Exam mark record not found');
    }
    return mark;
  }

  async update(
    id: string,
    dto: {
      examName?: string;
      examType?: string;
      subject?: string;
      marksObtained?: number;
      totalMarks?: number;
      grade?: string;
      remarks?: string;
      examDate?: string | Date;
    },
  ) {
    const academyId = this.tenantContextService.academyId;
    const mark = await this.examMarkModel.findOne({ _id: new Types.ObjectId(id), academyId });

    if (!mark) {
      throw new NotFoundException('Exam mark record not found');
    }

    if (dto.examName) mark.examName = dto.examName.trim();
    if (dto.examType) mark.examType = dto.examType.trim();
    if (dto.subject) mark.subject = dto.subject.trim();
    if (dto.remarks !== undefined) mark.remarks = dto.remarks.trim();
    if (dto.examDate) mark.examDate = new Date(dto.examDate);

    if (dto.marksObtained !== undefined || dto.totalMarks !== undefined) {
      const marksObtained = dto.marksObtained !== undefined ? Number(dto.marksObtained) : mark.marksObtained;
      const totalMarks = dto.totalMarks !== undefined ? Number(dto.totalMarks) : mark.totalMarks;

      if (isNaN(marksObtained) || marksObtained < 0) {
        throw new BadRequestException('Marks obtained must be a positive number');
      }
      if (isNaN(totalMarks) || totalMarks <= 0) {
        throw new BadRequestException('Total marks must be greater than 0');
      }
      if (marksObtained > totalMarks) {
        throw new BadRequestException(`Marks obtained (${marksObtained}) cannot exceed total marks (${totalMarks})`);
      }

      mark.marksObtained = marksObtained;
      mark.totalMarks = totalMarks;
      mark.percentage = Math.round(((marksObtained / totalMarks) * 100) * 100) / 100;
      mark.grade = dto.grade?.trim() ? dto.grade.trim() : calculateGrade(mark.percentage);
    } else if (dto.grade !== undefined) {
      mark.grade = dto.grade.trim();
    }

    await mark.save();
    return mark;
  }

  async remove(id: string) {
    const academyId = this.tenantContextService.academyId;
    const res = await this.examMarkModel.deleteOne({ _id: new Types.ObjectId(id), academyId });
    if (res.deletedCount === 0) {
      throw new NotFoundException('Exam mark record not found');
    }
    return { success: true, message: 'Test result deleted successfully' };
  }
}
