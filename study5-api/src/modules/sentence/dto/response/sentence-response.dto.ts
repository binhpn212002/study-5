import { ApiProperty } from '@nestjs/swagger';
import { HskLevel } from '../../../../common/constants/vocabulary.constant';

export class SentenceResponseDto {
  @ApiProperty({ description: 'Sentence ID' })
  id: string;

  @ApiProperty({ description: 'Vietnamese sentence' })
  vietnamese: string;

  @ApiProperty({ description: 'Chinese sentence' })
  chinese: string;

  @ApiProperty({ description: 'Pinyin pronunciation' })
  pinyin: string;

  @ApiProperty({ description: 'Meaning of the sentence' })
  meaning: string;

  @ApiProperty({ description: 'Hint or explanation', nullable: true })
  hint: string | null;

  @ApiProperty({ description: 'HSK level', enum: HskLevel })
  level: HskLevel;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}
