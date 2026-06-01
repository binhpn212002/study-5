import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from "class-validator";
import {
  HskLevel,
  LearnedStatus,
} from "../../../common/constants/vocabulary.constant";
import { PageOptionDto } from '../../../common/dto/page-option.dto';

export class ListVocabularyQueryDto extends PageOptionDto {
  @ApiPropertyOptional({
    description: "Search keyword (chinese, pinyin, vietnameseMeaning)",
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: "Filter by HSK level", enum: HskLevel })
  @IsOptional()
  @IsEnum(HskLevel)
  level?: HskLevel;

  @ApiPropertyOptional({ enum: LearnedStatus })
  @IsOptional()
  @IsEnum(LearnedStatus)
  learned?: LearnedStatus;
}
