import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ExamMark, ExamMarkDocument } from '../../database/schemas/exam-mark.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

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
    subject: string;
    marksObtained: number;
    totalMarks: number;
    grade?: string;
  }) {
    const academyId = this.tenantContextService.academyId;

    const percentage = (dto.marksObtained / dto.totalMarks) * 100;
    let grade = dto.grade || 'C';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 35) grade = 'C';
    else grade = 'F';

    const mark = await this.examMarkModel.create({
      academyId,
      classBatchId: new Types.ObjectId(dto.classBatchId),
      studentId: new Types.ObjectId(dto.studentId),
      examName: dto.examName,
      subject: dto.subject,
      marksObtained: dto.marksObtained,
      totalMarks: dto.totalMarks,
      grade,
      examDate: new Date(),
    });

    return mark;
  }

  async getStudentMarks(studentId: string) {
    const academyId = this.tenantContextService.academyId;
    return this.examMarkModel
      .find({ academyId, studentId: new Types.ObjectId(studentId) })
      .sort({ examDate: -1 })
      .exec();
  }

  async getClassMarks(classBatchId: string, examName?: string) {
    const academyId = this.tenantContextService.academyId;
    const query: any = { academyId, classBatchId: new Types.ObjectId(classBatchId) };
    if (examName) query.examName = examName;

    return this.examMarkModel
      .find(query)
      .populate('studentId')
      .sort({ createdAt: -1 })
      .exec();
  }
}
