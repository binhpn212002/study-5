import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { HskLevel } from '../../../common/constants/vocabulary.constant';

export class VocabularyByLevelParamDto {
  @ApiProperty({ description: 'HSK level', enum: HskLevel })
  @IsEnum(HskLevel)
  level: HskLevel;
}
