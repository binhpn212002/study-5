import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { HskLevel } from '../../../common/constants/vocabulary.constant';

export class UpdateSentenceDto {
  @ApiPropertyOptional({ description: 'Vietnamese sentence', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  vietnamese?: string;

  @ApiPropertyOptional({ description: 'Chinese sentence', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  chinese?: string;

  @ApiPropertyOptional({ description: 'Pinyin pronunciation', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pinyin?: string;

  @ApiPropertyOptional({ description: 'Meaning of the sentence' })
  @IsOptional()
  @IsString()
  meaning?: string;

  @ApiPropertyOptional({ description: 'Hint or explanation', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  hint?: string;

  @ApiPropertyOptional({ description: 'HSK level', enum: HskLevel })
  @IsOptional()
  @IsEnum(HskLevel)
  level?: HskLevel;

  @ApiPropertyOptional({ description: 'Order index', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
