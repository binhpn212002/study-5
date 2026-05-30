import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { HskLevel } from '../../../common/constants/vocabulary.constant';

export class UpdateVocabularyDto {
  @ApiPropertyOptional({ description: 'Chinese character/word', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  chinese?: string;

  @ApiPropertyOptional({ description: 'Pinyin pronunciation', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  pinyin?: string;

  @ApiPropertyOptional({ description: 'Vietnamese meaning', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  vietnameseMeaning?: string;

  @ApiPropertyOptional({ description: 'Example sentence', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  exampleSentence?: string;

  @ApiPropertyOptional({ description: 'Example sentence meaning', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  exampleMeaning?: string;

  @ApiPropertyOptional({ description: 'HSK level', enum: HskLevel })
  @IsOptional()
  @IsEnum(HskLevel)
  level?: HskLevel;
}
