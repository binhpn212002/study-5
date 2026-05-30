import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { HskLevel } from '../../../common/constants/vocabulary.constant';

export class CreateVocabularyDto {
  @ApiProperty({ description: 'Chinese character/word', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  chinese: string;

  @ApiProperty({ description: 'Pinyin pronunciation', maxLength: 255 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  pinyin: string;

  @ApiProperty({ description: 'Vietnamese meaning', maxLength: 500 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  vietnameseMeaning: string;

  @ApiProperty({ description: 'Example sentence', required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  exampleSentence?: string;

  @ApiProperty({ description: 'Example sentence meaning', required: false, maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  exampleMeaning?: string;

  @ApiProperty({ description: 'HSK level', enum: HskLevel })
  @IsNotEmpty()
  @IsEnum(HskLevel)
  level: HskLevel;
}
