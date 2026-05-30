import { Injectable } from '@nestjs/common';
import { VocabularyRepository, VocabularyQueryOptions } from '../repositories/vocabulary.repository';
import { Vocabulary } from '../../../database/entities/vocabulary.entity';
import {
  VocabularyResponseDto,
  VocabularyListResponseDto,
  HskLevelResponseDto,
} from '../dto/response/vocabulary-response.dto';
import { CreateVocabularyDto } from '../dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from '../dto/update-vocabulary.dto';
import { ListVocabularyQueryDto } from '../dto/list-vocabulary-query.dto';
import { HskLevel } from '../../../common/constants/vocabulary.constant';
import {
  VocabularyNotFoundException,
  VocabularyChineseDuplicateException,
} from '../../../common/exceptions/vocabulary.exceptions';
import { PageOptionDto } from '../../../common/dto/page-option.dto';
import { ListResponseDto } from '../../../common/dto/list-response.dto';

@Injectable()
export class VocabularyService {
  constructor(private readonly vocabularyRepository: VocabularyRepository) {}

  async create(dto: CreateVocabularyDto): Promise<VocabularyResponseDto> {
    const existing = await this.vocabularyRepository.findByChinese(dto.chinese);
    if (existing) {
      throw new VocabularyChineseDuplicateException(dto.chinese);
    }

    const entity = this.vocabularyRepository.create({
      chinese: dto.chinese,
      pinyin: dto.pinyin,
      vietnameseMeaning: dto.vietnameseMeaning,
      exampleSentence: dto.exampleSentence ?? null,
      exampleMeaning: dto.exampleMeaning ?? null,
      level: dto.level,
    });

    const saved = await this.vocabularyRepository.save(entity);
    return this.toResponseDto(saved);
  }

  async findAll(query: ListVocabularyQueryDto): Promise<ListResponseDto<VocabularyResponseDto>> {
    const pageOptions = new PageOptionDto();
    pageOptions.page = query.page ?? 1;
    pageOptions.limit = query.limit ?? 20;
    pageOptions.q = query.q;
    pageOptions.normalize();

    const queryOptions: VocabularyQueryOptions = {
      q: query.q,
      level: query.level,
      fromDate: query.fromDate,
      toDate: query.toDate,
    };

    const result = await this.vocabularyRepository.findAllWithPagination(
      pageOptions,
      queryOptions,
    );

    return ListResponseDto.create(
      result.items.map((item) => this.toResponseDto(item)),
      result.total,
      pageOptions.page,
      pageOptions.limit,
    );
  }

  async findById(id: string): Promise<VocabularyResponseDto> {
    const entity = await this.vocabularyRepository.findById(id);
    if (!entity) {
      throw new VocabularyNotFoundException(id);
    }
    return this.toResponseDto(entity);
  }

  async update(id: string, dto: UpdateVocabularyDto): Promise<VocabularyResponseDto> {
    const entity = await this.vocabularyRepository.findById(id);
    if (!entity) {
      throw new VocabularyNotFoundException(id);
    }

    if (dto.chinese && dto.chinese !== entity.chinese) {
      const existing = await this.vocabularyRepository.findByChinese(dto.chinese);
      if (existing) {
        throw new VocabularyChineseDuplicateException(dto.chinese);
      }
    }

    Object.assign(entity, {
      ...dto,
      updatedAt: new Date(),
    });

    const updated = await this.vocabularyRepository.save(entity);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.vocabularyRepository.findById(id);
    if (!entity) {
      throw new VocabularyNotFoundException(id);
    }

    await this.vocabularyRepository.softDelete(id);
  }

  async findByLevel(level: HskLevel): Promise<VocabularyResponseDto[]> {
    const entities = await this.vocabularyRepository.findByLevel(level);
    return entities.map((entity) => this.toResponseDto(entity));
  }

  async getAllLevels(): Promise<HskLevelResponseDto[]> {
    const counts = await this.vocabularyRepository.countByLevel();
    const countMap = new Map(counts.map((c) => [c.level, c.count]));

    return Object.values(HskLevel).map((level) => ({
      level,
      label: `HSK ${level.replace('HSK', '')}`,
      count: countMap.get(level) ?? 0,
    }));
  }

  private toResponseDto(entity: Vocabulary): VocabularyResponseDto {
    return {
      id: entity.id,
      chinese: entity.chinese,
      pinyin: entity.pinyin,
      vietnameseMeaning: entity.vietnameseMeaning,
      exampleSentence: entity.exampleSentence,
      exampleMeaning: entity.exampleMeaning,
      level: entity.level,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
