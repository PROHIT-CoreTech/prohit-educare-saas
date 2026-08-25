import { Injectable, BadRequestException, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { ClassBatch, ClassBatchDocument } from '../../database/schemas/class-batch.schema';
import { TenantContextService } from '../../common/services/tenant-context.service';

@Injectable()
export class ClassesService implements OnModuleInit {
  private readonly logger = new Logger(ClassesService.name);
  private indexesSynced = false;

  constructor(
    @InjectModel(ClassBatch.name) private classBatchModel: Model<ClassBatchDocument>,
    @InjectConnection() private connection: Connection,
    private tenantContextService: TenantContextService,
  ) {}

  async onModuleInit() {
    this.connection.once('open', async () => {
      await this.ensureSyncedIndexes();
    });
  }

  async ensureSyncedIndexes() {
    if (this.indexesSynced) return;
    try {
      if (!this.classBatchModel.collection) return;
      const indexes = await this.classBatchModel.collection.indexes().catch(() => []);
      for (const idx of indexes) {
        // If an index has 'standard' key but lacks 'batchName' key, it's a legacy single-batch index
        if (idx.name !== '_id_' && idx.key && idx.key.standard && !idx.key.batchName) {
          this.logger.log(`Dropping legacy conflicting index from MongoDB Atlas: ${idx.name}`);
          await this.classBatchModel.collection.dropIndex(idx.name).catch(() => {});
        }
      }
      await this.classBatchModel.syncIndexes();
      this.indexesSynced = true;
      this.logger.log('Successfully cleaned legacy indexes and synced ClassBatch schema indexes!');
    } catch (err: any) {
      this.logger.warn('ClassBatch index sync info:', err.message);
      this.indexesSynced = true;
    }
  }

  async create(dto: { standard: number; medium: string; section?: string; batchName: string }) {
    await this.ensureSyncedIndexes();
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
      this.logger.error('Class Batch creation error details:', error);
      if (error.code === 11000) {
        throw new BadRequestException(`A class batch named "${dto.batchName}" already exists for Std ${dto.standard} (${dto.medium}${dto.section !== 'none' ? ' - ' + dto.section : ''}).`);
      }
      throw new BadRequestException(`Failed to create class batch: ${error.message || 'Unknown database error'}`);
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
