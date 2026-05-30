import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { HskLevel } from '../../../common/constants/vocabulary.constant';

export class ListSentenceQueryDto {
  @ApiPropertyOptional({ description: 'Page number', minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Page size', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: 'orderIndex' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'orderIndex';

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsString()
  sortDir?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({ description: 'Search keyword', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  q?: string;

  @ApiPropertyOptional({ description: 'HSK level filter', enum: HskLevel })
  @IsOptional()
  @IsEnum(HskLevel)
  level?: HskLevel;
}
