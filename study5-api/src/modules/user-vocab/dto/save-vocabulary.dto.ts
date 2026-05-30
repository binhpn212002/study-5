import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveVocabularyDto {
  @ApiProperty({ description: 'Vocabulary ID to save' })
  @IsNotEmpty()
  @IsUUID()
  vocabId: string;
}
