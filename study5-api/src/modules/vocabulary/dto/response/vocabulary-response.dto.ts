import { ApiProperty } from '@nestjs/swagger';
import { HskLevel } from '../../../../common/constants/vocabulary.constant';

export class VocabularyResponseDto {
  @ApiProperty({ description: 'Vocabulary ID' })
  id: string;

  @ApiProperty({ description: 'Chinese character/word' })
  chinese: string;

  @ApiProperty({ description: 'Pinyin pronunciation' })
  pinyin: string;

  @ApiProperty({ description: 'Vietnamese meaning' })
  vietnameseMeaning: string;

  @ApiProperty({ description: 'Example sentence', nullable: true })
  exampleSentence: string | null;

  @ApiProperty({ description: 'Example sentence meaning', nullable: true })
  exampleMeaning: string | null;

  @ApiProperty({ description: 'HSK level', enum: HskLevel })
  level: HskLevel;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export class VocabularyListResponseDto {
  @ApiProperty({ description: 'List of vocabularies', type: [VocabularyResponseDto] })
  items: VocabularyResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Page size' })
  pageSize: number;
}

export class HskLevelResponseDto {
  @ApiProperty({ description: 'HSK level', enum: HskLevel })
  level: HskLevel;

  @ApiProperty({ description: 'Display label' })
  label: string;

  @ApiProperty({ description: 'Number of vocabularies' })
  count: number;
}
