import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { HskLevel } from '../../../common/constants/vocabulary.constant';
import { PageOptionDto, SortOrder } from '../../../common/dto/page-option.dto';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { LongSentence } from '../../../database/entities/long-sentence.entity';

export interface SentenceQueryOptions {
  q?: string;
  level?: HskLevel;
}

@Injectable()
export class SentenceRepository extends BaseRepository<LongSentence> {
  constructor(
    @InjectRepository(LongSentence)
    repository: Repository<LongSentence>,
  ) {
    super(repository);
  }

  async findAllWithPagination(
    pageOptions: PageOptionDto,
    options?: SentenceQueryOptions,
  ): Promise<{ items: LongSentence[]; total: number }> {
    const qb = this.createQueryBuilder('sentence');

    this.applyFilters(qb, options);

    const sortColumn = 'orderIndex';
    const sortDirection = pageOptions.sort === SortOrder.DESC ? 'DESC' : 'ASC';
    qb.orderBy(`sentence.${sortColumn}`, sortDirection);

    const [items, total] = await qb
      .skip(pageOptions.skip)
      .take(pageOptions.limit)
      .getManyAndCount();

    return { items, total };
  }

  async findById(id: string): Promise<LongSentence | null> {
    return this.findOne({
      where: { id } as any,
    });
  }

  async findByVietnameseAndLevel(
    vietnamese: string,
    level: HskLevel,
  ): Promise<LongSentence | null> {
    return this.findOneBy({
      vietnamese,
      level,
    } as any);
  }

  async findMaxOrderIndex(level: HskLevel): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('sentence')
      .select('MAX(sentence.order_index)', 'maxOrder')
      .where('sentence.level = :level', { level })
      .getRawOne();
    return result?.maxOrder ?? 0;
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  private applyFilters(
    qb: SelectQueryBuilder<LongSentence>,
    options?: SentenceQueryOptions,
  ): void {
    if (!options) return;

    qb.andWhere('sentence.deleted_at IS NULL');

    if (options.q) {
      const searchTerm = `%${options.q}%`;
      qb.andWhere(
        "(sentence.vietnamese ILIKE :q OR sentence.chinese ILIKE :q OR sentence.pinyin ILIKE :q)",
        { q: searchTerm },
      );
    }

    if (options.level) {
      qb.andWhere('sentence.level = :level', { level: options.level });
    }
  }
}
