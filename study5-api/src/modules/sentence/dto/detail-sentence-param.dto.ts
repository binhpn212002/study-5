import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class DetailSentenceParamDto {
  @ApiProperty({ description: 'Sentence ID (UUID)' })
  @IsUUID()
  id: string;
}
