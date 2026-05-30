import {
  Column,
  Entity,
  Index,
  Unique,
} from 'typeorm';
import { BaseEntity } from '../../shared/base.entity';
import { HskLevel } from '../../common/constants/vocabulary.constant';
import { SENTENCE_TABLE_NAME } from '../../common/constants/sentence.constant';

@Entity(SENTENCE_TABLE_NAME)
@Unique('idx_long_sentences_vietnamese_level', ['vietnamese', 'level'])
@Index('idx_long_sentences_level', ['level'])
@Index('idx_long_sentences_order_index', ['orderIndex'])
export class LongSentence extends BaseEntity {
  @Column({ type: 'varchar', length: 500 })
  vietnamese: string;

  @Column({ type: 'varchar', length: 500 })
  chinese: string;

  @Column({ type: 'varchar', length: 500 })
  pinyin: string;

  @Column({ type: 'text' })
  meaning: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hint: string | null;

  @Column({
    type: 'varchar',
    length: 10,
  })
  level: HskLevel;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  orderIndex: number;
}
