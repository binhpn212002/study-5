import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DetailVocabularyParamDto {
  @ApiProperty({ description: 'Vocabulary ID (UUID)' })
  @IsUUID()
  id: string;
}
