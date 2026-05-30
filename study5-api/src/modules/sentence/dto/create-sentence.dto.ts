import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { HskLevel } from '../../../common/constants/vocabulary.constant';

export class CreateSentenceDto {
  @ApiProperty({ description: 'Vietnamese sentence', maxLength: 500 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  vietnamese: string;

  @ApiProperty({ description: 'Chinese sentence', maxLength: 500 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  chinese: string;

  @ApiProperty({ description: 'Pinyin pronunciation', maxLength: 500 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  pinyin: string;

  @ApiProperty({ description: 'Meaning of the sentence' })
  @IsNotEmpty()
  @IsString()
  meaning: string;

  @ApiProperty({ description: 'Hint or explanation', required: false, maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  hint?: string;

  @ApiProperty({ description: 'HSK level', enum: HskLevel })
  @IsNotEmpty()
  @IsEnum(HskLevel)
  level: HskLevel;

  @ApiProperty({ description: 'Order index', required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
