import { IsOptional, IsInt, Min, Max, IsIn, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { HskLevel } from '../../../common/constants/vocabulary.constant';
import { VocabStatus } from '../../../common/constants/vocab-status.constant';
import { SortOrder, toInt } from '../../../common/dto/page-option.dto';

export class ListUserVocabQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => toInt(value, 1))
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => toInt(value, 20))
  pageSize?: number = 20;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ enum: HskLevel })
  @IsOptional()
  @IsEnum(HskLevel)
  level?: HskLevel;

  @ApiPropertyOptional({ enum: VocabStatus })
  @IsOptional()
  @IsEnum(VocabStatus)
  status?: VocabStatus;
}
