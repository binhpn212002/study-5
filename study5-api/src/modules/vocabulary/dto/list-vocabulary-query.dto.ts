import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { HskLevel } from '../../../common/constants/vocabulary.constant';
import { PageOptionDto } from '../../../common/dto/page-option.dto';

export class ListVocabularyQueryDto extends PageOptionDto {
  @ApiPropertyOptional({ description: 'Search keyword (chinese, pinyin, vietnameseMeaning)' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by HSK level', enum: HskLevel })
  @IsOptional()
  @IsEnum(HskLevel)
  level?: HskLevel;

  @ApiPropertyOptional({ description: 'Filter from date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter to date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
