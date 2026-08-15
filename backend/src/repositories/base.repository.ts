import { Model, UpdateQuery } from 'mongoose';
import { QueryOptions, PaginationMeta } from '../types';
import { calculatePaginationMeta, parseQueryOptions } from '../utils/queryHelpers';

export type RepositoryFilter<T> = Record<string, unknown>;

export abstract class BaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  public async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  public async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  public async findOne(filter: RepositoryFilter<T>): Promise<T | null> {
    return this.model.findOne(filter as never).exec();
  }

  public async findAll(filter: RepositoryFilter<T> = {}): Promise<T[]> {
    return this.model.find(filter as never).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  public async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  public async paginate(
    filter: RepositoryFilter<T> = {},
    options: QueryOptions = {}
  ): Promise<{ items: T[]; meta: PaginationMeta }> {
    const { page, limit, sortBy, sortOrder } = parseQueryOptions(options as Record<string, unknown>);
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.model
        .find(filter as never)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter as never).exec(),
    ]);

    const meta = calculatePaginationMeta(totalItems, page, limit);
    return { items, meta };
  }
}
