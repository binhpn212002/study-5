import { Injectable } from '@nestjs/common';
import { SentenceRepository, SentenceQueryOptions } from '../repositories/sentence.repository';
import { LongSentence } from '../../../database/entities/long-sentence.entity';
import { SentenceResponseDto } from '../dto/response/sentence-response.dto';
import { CreateSentenceDto } from '../dto/create-sentence.dto';
import { UpdateSentenceDto } from '../dto/update-sentence.dto';
import { ListSentenceQueryDto } from '../dto/list-sentence-query.dto';
import { HskLevel } from '../../../common/constants/vocabulary.constant';
import {
  SentenceNotFoundException,
  SentenceDuplicateException,
} from '../../../common/exceptions/sentence.exceptions';
import { PageOptionDto, SortOrder } from '../../../common/dto/page-option.dto';
import { ListResponseDto } from '../../../common/dto/list-response.dto';

@Injectable()
export class SentenceService {
  constructor(private readonly sentenceRepository: SentenceRepository) {}

  async create(dto: CreateSentenceDto): Promise<SentenceResponseDto> {
    const existing = await this.sentenceRepository.findByVietnameseAndLevel(
      dto.vietnamese,
      dto.level,
    );
    if (existing) {
      throw new SentenceDuplicateException(dto.vietnamese, dto.level);
    }

    let orderIndex = dto.orderIndex;
    if (orderIndex === undefined) {
      const maxOrder = await this.sentenceRepository.findMaxOrderIndex(dto.level);
      orderIndex = maxOrder + 1;
    }

    const entity = this.sentenceRepository.create({
      vietnamese: dto.vietnamese,
      chinese: dto.chinese,
      pinyin: dto.pinyin,
      meaning: dto.meaning,
      hint: dto.hint ?? null,
      level: dto.level,
      orderIndex,
    });

    const saved = await this.sentenceRepository.save(entity);
    return this.toResponseDto(saved);
  }

  async findAll(query: ListSentenceQueryDto): Promise<ListResponseDto<SentenceResponseDto>> {
    const pageOptions = new PageOptionDto();
    pageOptions.page = query.page ?? 1;
    pageOptions.limit = query.limit ?? 20;
    pageOptions.q = query.q;
    pageOptions.sort = query.sortDir === 'desc' ? SortOrder.DESC : SortOrder.ASC;
    pageOptions.normalize();

    const queryOptions: SentenceQueryOptions = {
      q: query.q,
      level: query.level,
    };

    const result = await this.sentenceRepository.findAllWithPagination(
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

  async findById(id: string): Promise<SentenceResponseDto> {
    const entity = await this.sentenceRepository.findById(id);
    if (!entity) {
      throw new SentenceNotFoundException(id);
    }
    return this.toResponseDto(entity);
  }

  async update(id: string, dto: UpdateSentenceDto): Promise<SentenceResponseDto> {
    const entity = await this.sentenceRepository.findById(id);
    if (!entity) {
      throw new SentenceNotFoundException(id);
    }

    const targetLevel = dto.level ?? entity.level;
    const targetVietnamese = dto.vietnamese ?? entity.vietnamese;

    if (dto.vietnamese || dto.level) {
      const existing = await this.sentenceRepository.findByVietnameseAndLevel(
        targetVietnamese,
        targetLevel,
      );
      if (existing && existing.id !== id) {
        throw new SentenceDuplicateException(targetVietnamese, targetLevel);
      }
    }

    Object.assign(entity, {
      ...dto,
      updatedAt: new Date(),
    });

    const updated = await this.sentenceRepository.save(entity);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.sentenceRepository.findById(id);
    if (!entity) {
      throw new SentenceNotFoundException(id);
    }

    await this.sentenceRepository.softDelete(id);
  }

  private toResponseDto(entity: LongSentence): SentenceResponseDto {
    return {
      id: entity.id,
      vietnamese: entity.vietnamese,
      chinese: entity.chinese,
      pinyin: entity.pinyin,
      meaning: entity.meaning,
      hint: entity.hint,
      level: entity.level,
      orderIndex: entity.orderIndex,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
