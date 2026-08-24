import { Model, Document, FilterQuery, UpdateQuery, QueryOptions, ClientSession, PipelineStage } from 'mongoose';
import { TenantContextService } from '../services/tenant-context.service';

export abstract class TenantScopedRepository<T extends Document> {
  constructor(
    protected readonly model: Model<T>,
    protected readonly tenantContext: TenantContextService,
  ) {}

  protected getScopeFilter(filter: FilterQuery<T> = {}): FilterQuery<T> {
    const academyId = this.tenantContext.academyId;
    return {
      ...filter,
      academyId,
    };
  }

  async create(doc: Partial<T>, session?: ClientSession): Promise<T> {
    const academyId = this.tenantContext.academyId;
    const payload = {
      ...doc,
      academyId,
    };
    if (session) {
      const [created] = await this.model.create([payload], { session });
      return created;
    }
    return await this.model.create(payload);
  }

  async find(filter: FilterQuery<T> = {}, projection?: any, options?: QueryOptions): Promise<T[]> {
    const scopedFilter = this.getScopeFilter(filter);
    return this.model.find(scopedFilter, projection, options).exec();
  }

  async findOne(filter: FilterQuery<T> = {}, projection?: any, options?: QueryOptions): Promise<T | null> {
    const scopedFilter = this.getScopeFilter(filter);
    return this.model.findOne(scopedFilter, projection, options).exec();
  }

  async findById(id: string, projection?: any, options?: QueryOptions): Promise<T | null> {
    const scopedFilter = this.getScopeFilter({ _id: id } as any);
    return this.model.findOne(scopedFilter, projection, options).exec();
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<any> {
    const scopedFilter = this.getScopeFilter(filter);
    return this.model.updateOne(scopedFilter, update, options as any).exec();
  }

  async findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: QueryOptions): Promise<T | null> {
    const scopedFilter = this.getScopeFilter(filter);
    return (await this.model.findOneAndUpdate(scopedFilter, update, { new: true, ...(options as any) }).exec()) as unknown as T | null;
  }

  async deleteOne(filter: FilterQuery<T>): Promise<any> {
    const scopedFilter = this.getScopeFilter(filter);
    return this.model.deleteOne(scopedFilter).exec();
  }

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    const scopedFilter = this.getScopeFilter(filter);
    return this.model.countDocuments(scopedFilter).exec();
  }

  async aggregate<R = any>(pipeline: PipelineStage[] = []): Promise<R[]> {
    const academyId = this.tenantContext.academyId;
    const matchStage: PipelineStage = { $match: { academyId } };
    return this.model.aggregate<R>([matchStage, ...pipeline]).exec();
  }
}
