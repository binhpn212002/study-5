import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VocabStatus } from '../../../common/constants/vocab-status.constant';

export class UpdateVocabStatusDto {
  @ApiProperty({ enum: VocabStatus, description: 'New status for the vocabulary' })
  @IsNotEmpty()
  @IsEnum(VocabStatus)
  status: VocabStatus;
}
