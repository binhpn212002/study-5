import { InjectQueue } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Queue } from "bull";
import { parse } from "csv-parse/sync";
import {
  IMPORT_TYPE_SENTENCE,
  QUEUE_IMPORT,
} from "../../../common/constants/hsk.constant";
import { ListResponseDto } from "../../../common/dto/list-response.dto";
import { PageOptionDto, SortOrder } from "../../../common/dto/page-option.dto";
import {
  SentenceDuplicateException,
  SentenceNotFoundException,
} from "../../../common/exceptions/sentence.exceptions";
import { LongSentence } from "../../../database/entities/long-sentence.entity";
import { CreateSentenceDto } from "../dto/create-sentence.dto";
import { ListSentenceQueryDto } from "../dto/list-sentence-query.dto";
import { SentenceResponseDto } from "../dto/response/sentence-response.dto";
import { UpdateSentenceDto } from "../dto/update-sentence.dto";
import {
  SentenceQueryOptions,
  SentenceRepository,
} from "../repositories/sentence.repository";

@Injectable()
export class SentenceService {
  constructor(
    private readonly sentenceRepository: SentenceRepository,
    @InjectQueue(QUEUE_IMPORT)
    private readonly sentenceQueue: Queue,
  ) {}

  async create(dto: CreateSentenceDto): Promise<SentenceResponseDto> {
    const existing = await this.sentenceRepository.findByVietnameseAndLevel(
      dto.vietnamese,
      dto.level,
    );
    if (existing) {
      throw new SentenceDuplicateException(dto.vietnamese, dto.level);
    }

    const entity = this.sentenceRepository.create({
      vietnamese: dto.vietnamese,
      chinese: dto.chinese,
      pinyin: dto.pinyin,
      meaning: dto.meaning,
      hint: dto.hint ?? null,
      level: dto.level,
    });

    const saved = await this.sentenceRepository.save(entity);
    return this.toResponseDto(saved);
  }

  async findAll(
    query: ListSentenceQueryDto,
  ): Promise<ListResponseDto<SentenceResponseDto>> {
    const pageOptions = new PageOptionDto();
    pageOptions.page = query.page ?? 1;
    pageOptions.limit = query.limit ?? 20;
    pageOptions.q = query.q;
    pageOptions.sort =
      query.sortDir === "desc" ? SortOrder.DESC : SortOrder.ASC;
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

  async update(
    id: string,
    dto: UpdateSentenceDto,
  ): Promise<SentenceResponseDto> {
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
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
  async import(
    fileBuffer: Buffer,
  ): Promise<{ jobId: number; total: number; skipped: number }> {
    const csvContent = fileBuffer.toString("utf8");
    const records: Record<string, string>[] = parse(csvContent, {
      columns: (header) => header.map((col) => col.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
    });
    const job = await this.sentenceQueue.add(QUEUE_IMPORT, {
      rows: records,
      type: IMPORT_TYPE_SENTENCE,
    });

    return { jobId: job.id as number, total: records.length, skipped: 0 };
  }
}
