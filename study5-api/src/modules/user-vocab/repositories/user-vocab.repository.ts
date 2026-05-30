import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { HskLevel } from '../../../common/constants/vocabulary.constant';
import { VocabStatus } from '../../../common/constants/vocab-status.constant';
import { PageOptionDto, SortOrder } from '../../../common/dto/page-option.dto';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { UserVocabulary } from '../../../database/entities/user-vocabulary.entity';

export interface UserVocabQueryOptions {
  level?: HskLevel;
  status?: VocabStatus;
  userId?: string;
}

@Injectable()
export class UserVocabRepository extends BaseRepository<UserVocabulary> {
  constructor(
    @InjectRepository(UserVocabulary)
    repository: Repository<UserVocabulary>,
  ) {
    super(repository);
  }

  async findByUserIdAndVocabId(
    userId: string,
    vocabId: string,
  ): Promise<UserVocabulary | null> {
    return this.findOne({
      where: { userId, vocabId } as any,
      relations: ['vocabulary'],
    });
  }

  async findAllWithPagination(
    userId: string,
    pageOptions: PageOptionDto,
    options?: UserVocabQueryOptions,
  ): Promise<{ items: UserVocabulary[]; total: number }> {
    const qb = this.createQueryBuilder('uv');

    qb.andWhere('uv.user_id = :userId', { userId });
    qb.andWhere('uv.is_saved = :isSaved', { isSaved: true });

    this.applyFilters(qb, options);

    const sortDirection = pageOptions.sort === SortOrder.DESC ? 'DESC' : 'ASC';
    qb.orderBy('uv.createdAt', sortDirection);

    const [items, total] = await qb
      .leftJoinAndSelect('uv.vocabulary', 'vocabulary')
      .skip(pageOptions.skip)
      .take(pageOptions.limit)
      .getManyAndCount();

    return { items, total };
  }

  async findAllAdminWithPagination(
    pageOptions: PageOptionDto,
    options?: UserVocabQueryOptions,
  ): Promise<{ items: UserVocabulary[]; total: number }> {
    const qb = this.createQueryBuilder('uv');

    qb.andWhere('uv.is_saved = :isSaved', { isSaved: true });

    this.applyFilters(qb, options);

    const sortDirection = pageOptions.sort === SortOrder.DESC ? 'DESC' : 'ASC';
    qb.orderBy('uv.createdAt', sortDirection);

    const [items, total] = await qb
      .leftJoinAndSelect('uv.vocabulary', 'vocabulary')
      .skip(pageOptions.skip)
      .take(pageOptions.limit)
      .getManyAndCount();

    return { items, total };
  }

  async upsert(
    userId: string,
    vocabId: string,
    isSaved: boolean,
    status: VocabStatus,
  ): Promise<UserVocabulary> {
    const existing = await this.findOneBy({ userId, vocabId } as any);

    if (existing) {
      existing.isSaved = isSaved;
      if (isSaved && existing.status === VocabStatus.NEW) {
        existing.status = status;
      }
      return this.save(existing);
    }

    const entity = this.create({
      userId,
      vocabId,
      isSaved,
      status,
    });
    return this.createAndSave(entity);
  }

  private applyFilters(
    qb: SelectQueryBuilder<UserVocabulary>,
    options?: UserVocabQueryOptions,
  ): void {
    if (!options) return;

    if (options.level) {
      qb.andWhere('vocabulary.level = :level', { level: options.level });
    }

    if (options.status) {
      qb.andWhere('uv.status = :status', { status: options.status });
    }

    if (options.userId) {
      qb.andWhere('uv.user_id = :userId', { userId: options.userId });
    }
  }
}
