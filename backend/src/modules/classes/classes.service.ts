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

    const stdNum = Number(dto.standard);
    if (isNaN(stdNum) || stdNum < -4 || stdNum > 15) {
      throw new BadRequestException('Academic standard must be a valid number between -4 (Day Care) and 15 (TY Degree).');
    }

    const medium = (dto.medium || 'english').toLowerCase().trim();
    if (!['english', 'marathi', 'semi_english', 'hindi'].includes(medium)) {
      throw new BadRequestException('Medium must be one of: english, marathi, semi_english, hindi.');
    }

    let section = 'none';
    if (stdNum >= 11) {
      if (medium !== 'english') {
        throw new BadRequestException('Standard 11 and above is locked to "english" medium.');
      }
      section = (dto.section || '').toLowerCase().trim();
      if (!['science', 'commerce', 'arts'].includes(section)) {
        throw new BadRequestException('Section (science, commerce, or arts) is required for standard 11 and above.');
      }
    }

    const stdDisplay = stdNum === -4 ? 'Day Care' : stdNum === -3 ? 'Playgroup' : stdNum === -2 ? 'Nursery' : stdNum === -1 ? 'Jr KG' : stdNum === 0 ? 'Sr KG' : `Std ${stdNum}`;
    let batchName = (dto.batchName || '').trim();
    if (!batchName) {
      batchName = `Class ${stdDisplay} (${medium.toUpperCase()}${section !== 'none' ? ' - ' + section.toUpperCase() : ''})`;
    }

    // Idempotent resolution: Return existing batch if one already exists for this exact signature
    const existing = await this.classBatchModel.findOne({
      academyId,
      standard: stdNum,
      medium,
      section,
      batchName,
    }).exec();

    if (existing) {
      return existing;
    }

    try {
      const batch = await this.classBatchModel.create({
        academyId,
        standard: stdNum,
        medium,
        section,
        batchName,
      });

      return batch;
    } catch (error: any) {
      this.logger.error('Class Batch creation error details:', error);
      if (error.code === 11000) {
        const fallbackExisting = await this.classBatchModel.findOne({
          academyId,
          standard: stdNum,
          medium,
          section,
          batchName,
        }).exec();
        if (fallbackExisting) return fallbackExisting;

        throw new BadRequestException(`A class batch named "${batchName}" already exists for ${stdDisplay} (${medium}${section !== 'none' ? ' - ' + section : ''}).`);
      }
      if (error.name === 'ValidationError') {
        const msgs = Object.values(error.errors || {}).map((e: any) => e.message).join(', ');
        throw new BadRequestException(`Class batch validation error: ${msgs}`);
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
