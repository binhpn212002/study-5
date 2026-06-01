import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { USER_VOCABULARY_TABLE_NAME } from "../../../common/constants/hsk.constant";
import {
  HskLevel,
  LearnedStatus,
} from "../../../common/constants/vocabulary.constant";
import { PageOptionDto, SortOrder } from "../../../common/dto/page-option.dto";
import { BaseRepository } from "../../../common/repositories/base.repository";
import { Vocabulary } from "../../../database/entities/vocabulary.entity";

export interface VocabularyQueryOptions {
  q?: string;
  level?: HskLevel;
  learned?: LearnedStatus;
}

@Injectable()
export class VocabularyRepository extends BaseRepository<Vocabulary> {
  constructor(
    @InjectRepository(Vocabulary)
    repository: Repository<Vocabulary>,
  ) {
    super(repository);
  }

  async findAllWithPagination(
    pageOptions: PageOptionDto,
    options?: VocabularyQueryOptions,
    userId?: string,
  ): Promise<{ items: Vocabulary[]; total: number }> {
    const qb = this.createQueryBuilder("vocabulary").leftJoin(
      USER_VOCABULARY_TABLE_NAME,
      "uv",
      "uv.vocabId = vocabulary.id",
    );

    this.applyFilters(qb, options, userId);

    const sortDirection = pageOptions.sort === SortOrder.ASC ? "ASC" : "DESC";
    qb.orderBy("vocabulary.createdAt", sortDirection);

    const [items, total] = await qb
      .skip(pageOptions.skip)
      .take(pageOptions.limit)
      .getManyAndCount();

    return { items, total };
  }

  async findById(id: string): Promise<Vocabulary | null> {
    return this.findOne({
      where: { id } as any,
    });
  }

  async findByChinese(chinese: string): Promise<Vocabulary | null> {
    return this.findOneBy({ chinese } as any);
  }

  async findByLevel(level: HskLevel): Promise<Vocabulary[]> {
    return this.find({
      where: { level } as any,
      order: { chinese: "ASC" },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async countByLevel(): Promise<{ level: HskLevel; count: number }[]> {
    const result = await this.repository
      .createQueryBuilder("vocabulary")
      .select("vocabulary.level", "level")
      .addSelect("COUNT(*)", "count")
      .groupBy("vocabulary.level")
      .getRawMany();

    return result.map((r) => ({
      level: r.level as HskLevel,
      count: parseInt(r.count, 10),
    }));
  }

  private applyFilters(
    qb: SelectQueryBuilder<Vocabulary>,
    options?: VocabularyQueryOptions,
    userId?: string,
  ): void {
    if (!options) return;

    qb.andWhere("vocabulary.deleted_at IS NULL");

    if (options.q) {
      const searchTerm = `%${options.q}%`;
      qb.andWhere(
        "(vocabulary.chinese ILIKE :q OR vocabulary.pinyin ILIKE :q OR vocabulary.vietnameseMeaning ILIKE :q)",
        { q: searchTerm },
      );
    }

    if (options.level) {
      qb.andWhere("vocabulary.level = :level", { level: options.level });
    }

    if (options.learned === LearnedStatus.LEARNED && userId) {
      qb.andWhere("uv.userId = :userId", { userId });
      qb.andWhere("uv.isSaved = :isSaved", { isSaved: true });
    }
    if (options.learned === LearnedStatus.NOT_LEARNED && userId) {
      qb.andWhere("uv.userId = :userId", { userId });
      qb.andWhere("uv.isSaved = :isSaved", { isSaved: false });
    }
  }
}
