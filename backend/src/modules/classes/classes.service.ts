import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassBatch, ClassBatchDocument } from '../../database/schemas/class-batch.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(ClassBatch.name) private classBatchModel: Model<ClassBatchDocument>,
    private tenantContextService: TenantContextService,
  ) {}

  async create(dto: { standard: number; medium: string; section?: string; batchName: string }) {
    const academyId = this.tenantContextService.academyId;

    if (dto.standard >= 11) {
      if (dto.medium !== 'english') {
        throw new BadRequestException('Standard 11 and above is locked to "english" medium');
      }
      if (!dto.section || !['science', 'commerce', 'arts'].includes(dto.section)) {
        throw new BadRequestException('Section (science, commerce, or arts) is required for standard 11 and above');
      }
    } else {
      dto.section = 'none';
    }

    try {
      const batch = await this.classBatchModel.create({
        academyId,
        standard: dto.standard,
        medium: dto.medium,
        section: dto.section,
        batchName: dto.batchName,
      });

      return batch;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new BadRequestException(`A class batch named "${dto.batchName}" already exists for Std ${dto.standard} ${dto.medium} ${dto.section !== 'none' ? dto.section : ''}.`);
      }
      throw error;
    }
  }

  async findAll() {
    const academyId = this.tenantContextService.academyId;
    return this.classBatchModel.find({ academyId }).sort({ standard: 1, batchName: 1 }).exec();
  }

  async findOne(id: string) {
    const academyId = this.tenantContextService.academyId;
    const batch = await this.classBatchModel.findOne({ _id: id, academyId }).exec();
    if (!batch) throw new NotFoundException('Class Batch not found or cross-tenant access denied');
    return batch;
  }
}
