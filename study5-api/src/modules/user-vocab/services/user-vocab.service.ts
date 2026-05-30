import { Injectable } from "@nestjs/common";
import { VocabStatus } from "../../../common/constants/vocab-status.constant";
import { ListResponseDto } from "../../../common/dto/list-response.dto";
import { PageOptionDto, SortOrder } from "../../../common/dto/page-option.dto";
import {
  InvalidStatusTransitionException,
  UserVocabNotFoundException,
} from "../../../common/exceptions/user-vocab.exceptions";
import { VocabularyResponseDto } from "../../vocabulary/dto/response/vocabulary-response.dto";
import { VocabularyService } from "../../vocabulary/services/vocabulary.service";
import { ListUserVocabQueryDto } from "../dto/list-user-vocab-query.dto";
import { UserVocabResponseDto } from "../dto/response/user-vocab-response.dto";
import { SaveVocabularyDto } from "../dto/save-vocabulary.dto";
import { UpdateVocabStatusDto } from "../dto/update-vocab-status.dto";
import {
  UserVocabQueryOptions,
  UserVocabRepository,
} from "../repositories/user-vocab.repository";

@Injectable()
export class UserVocabService {
  constructor(
    private readonly userVocabRepository: UserVocabRepository,
    private readonly vocabularyService: VocabularyService,
  ) {}

  async save(
    userId: string,
    dto: SaveVocabularyDto,
  ): Promise<UserVocabResponseDto> {
    const vocabularyDto = await this.vocabularyService.findById(dto.vocabId);

    const userVocab = await this.userVocabRepository.upsert(
      userId,
      dto.vocabId,
      true,
      VocabStatus.NEW,
    );

    return this.toResponseDtoFromEntity(userVocab, vocabularyDto);
  }

  async remove(userId: string, vocabId: string): Promise<void> {
    const userVocab = await this.userVocabRepository.findByUserIdAndVocabId(
      userId,
      vocabId,
    );
    if (!userVocab) {
      throw new UserVocabNotFoundException(vocabId);
    }

    userVocab.isSaved = false;
    await this.userVocabRepository.save(userVocab);
  }

  async findAll(
    userId: string,
    query: ListUserVocabQueryDto,
  ): Promise<ListResponseDto<UserVocabResponseDto>> {
    const pageOptions = new PageOptionDto();
    pageOptions.page = query.page ?? 1;
    pageOptions.limit = query.pageSize ?? 20;
    pageOptions.sort = query.sortDir === "asc" ? SortOrder.ASC : SortOrder.DESC;
    pageOptions.normalize();

    const queryOptions: UserVocabQueryOptions = {
      level: query.level,
      status: query.status,
    };

    const result = await this.userVocabRepository.findAllWithPagination(
      userId,
      pageOptions,
      queryOptions,
    );

    return ListResponseDto.create(
      result.items.map((item) => this.toResponseDtoFromEntity(item)),
      result.total,
      pageOptions.page,
      pageOptions.limit,
    );
  }

  async findByVocabId(
    userId: string,
    vocabId: string,
  ): Promise<UserVocabResponseDto> {
    const userVocab = await this.userVocabRepository.findByUserIdAndVocabId(
      userId,
      vocabId,
    );
    if (!userVocab || !userVocab.isSaved) {
      throw new UserVocabNotFoundException(vocabId);
    }

    return this.toResponseDtoFromEntity(userVocab);
  }

  async updateStatus(
    userId: string,
    vocabId: string,
    dto: UpdateVocabStatusDto,
  ): Promise<UserVocabResponseDto> {
    const userVocab = await this.userVocabRepository.findByUserIdAndVocabId(
      userId,
      vocabId,
    );
    if (!userVocab) {
      throw new UserVocabNotFoundException(vocabId);
    }

    this.validateStatusTransition(userVocab.status, dto.status);

    userVocab.status = dto.status;
    const updated = await this.userVocabRepository.save(userVocab);

    return this.toResponseDtoFromEntity(updated);
  }

  async findAllAdmin(
    query: ListUserVocabQueryDto,
  ): Promise<ListResponseDto<UserVocabResponseDto>> {
    const pageOptions = new PageOptionDto();
    pageOptions.page = query.page ?? 1;
    pageOptions.limit = query.pageSize ?? 20;
    pageOptions.sort = query.sortDir === "asc" ? SortOrder.ASC : SortOrder.DESC;
    pageOptions.normalize();

    const queryOptions: UserVocabQueryOptions = {
      level: query.level,
      status: query.status,
    };

    const result = await this.userVocabRepository.findAllAdminWithPagination(
      pageOptions,
      queryOptions,
    );

    return ListResponseDto.create(
      result.items.map((item) => this.toResponseDtoFromEntity(item)),
      result.total,
      pageOptions.page,
      pageOptions.limit,
    );
  }

  private validateStatusTransition(
    current: VocabStatus,
    next: VocabStatus,
  ): void {
    const validTransitions: Record<VocabStatus, VocabStatus[]> = {
      [VocabStatus.NEW]: [VocabStatus.LEARNING],
      [VocabStatus.LEARNING]: [VocabStatus.REVIEWING],
      [VocabStatus.REVIEWING]: [VocabStatus.MASTERED, VocabStatus.LEARNING],
      [VocabStatus.MASTERED]: [VocabStatus.REVIEWING],
    };

    const allowed = validTransitions[current];
    if (!allowed || !allowed.includes(next)) {
      throw new InvalidStatusTransitionException(current, next);
    }
  }

  private toResponseDtoFromEntity(
    entity: any,
    vocabularyDto?: VocabularyResponseDto,
  ): UserVocabResponseDto {
    const vocab = vocabularyDto ?? entity.vocabulary;

    return {
      id: entity.id,
      vocabId: entity.vocabId,
      chinese: vocab?.chinese ?? "",
      pinyin: vocab?.pinyin ?? "",
      meaning: vocab?.vietnameseMeaning ?? "",
      level: vocab?.level,
      isSaved: entity.isSaved,
      status: entity.status,
      savedAt: entity.createdAt,
    };
  }
}
