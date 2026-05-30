import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DetailUserVocabParamDto {
  @ApiProperty({ description: 'Vocabulary ID' })
  @IsUUID()
  vocabId: string;
}
