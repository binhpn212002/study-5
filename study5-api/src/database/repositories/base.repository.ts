import { Prisma, PrismaClient } from '@prisma/client';
import { prismaClient } from '../client';

export interface IFindManyOptions<T = unknown> {
  where?: T;
  orderBy?: Record<string, string>;
  skip?: number;
  take?: number;
  select?: unknown;
  include?: unknown;
}

export interface IFindOneOptions<T = unknown> {
  where: T;
  select?: unknown;
  include?: unknown;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseRepository {
  protected abstract readonly modelName: keyof PrismaClient;

  protected get client(): PrismaClient {
    return prismaClient;
  }

  protected get model() {
    return this.client[this.modelName];
  }

  async findById<T>(id: number): Promise<T | null> {
    return (
      this.model as unknown as {
        findUnique: (args: { where: { id: number } }) => Promise<unknown>;
      }
    ).findUnique({
      where: { id },
    }) as Promise<T | null>;
  }

  async findOne<T>(options: IFindOneOptions): Promise<T | null> {
    return (
      this.model as unknown as {
        findFirst: (args: {
          where: unknown;
          select?: unknown;
          include?: unknown;
        }) => Promise<unknown>;
      }
    ).findFirst({
      where: options.where,
      select: options.select,
      include: options.include,
    }) as Promise<T | null>;
  }

  async findAll<T>(options?: IFindManyOptions): Promise<T[]> {
    return (
      this.model as unknown as {
        findMany: (args?: {
          where?: unknown;
          orderBy?: unknown;
          skip?: number;
          take?: number;
          select?: unknown;
          include?: unknown;
        }) => Promise<unknown[]>;
      }
    ).findMany({
      where: options?.where,
      orderBy: options?.orderBy,
      skip: options?.skip,
      take: options?.take,
      select: options?.select,
      include: options?.include,
    }) as Promise<T[]>;
  }

  async findAndCount<T>(options?: IFindManyOptions): Promise<[T[], number]> {
    const [data, total] = await Promise.all([
      this.findAll<T>(options),
      this.count(options?.where),
    ]);
    return [data, total];
  }

  async paginate<T>(
    page: number,
    limit: number,
    options?: IFindManyOptions,
  ): Promise<IPaginatedResult<T>> {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.findAll<T>({ ...options, skip, take: limit }),
      this.count(options?.where),
    ]);
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create<T>(data: T): Promise<T> {
    return (
      this.model as unknown as {
        create: (args: { data: unknown }) => Promise<unknown>;
      }
    ).create({
      data,
    }) as Promise<T>;
  }

  async update<T>(id: number, data: T): Promise<T> {
    return (
      this.model as unknown as {
        update: (args: {
          where: { id: number };
          data: unknown;
        }) => Promise<unknown>;
      }
    ).update({
      where: { id },
      data,
    }) as Promise<T>;
  }

  async upsert<T>(
    data: T,
    update: Partial<T>,
    uniqueField: Record<string, unknown>,
  ): Promise<T> {
    return (
      this.model as unknown as {
        upsert: (args: {
          where: unknown;
          create: unknown;
          update: unknown;
        }) => Promise<unknown>;
      }
    ).upsert({
      where: uniqueField,
      create: data,
      update,
    }) as Promise<T>;
  }

  async delete<T>(id: number): Promise<T> {
    return (
      this.model as unknown as {
        delete: (args: { where: { id: number } }) => Promise<unknown>;
      }
    ).delete({
      where: { id },
    }) as Promise<T>;
  }

  async exists(where: unknown): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  async count(where?: unknown): Promise<number> {
    return (
      this.model as unknown as {
        count: (args?: { where?: unknown }) => Promise<number>;
      }
    ).count({ where });
  }
}
