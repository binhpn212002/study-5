import { Column, Entity } from 'typeorm';
import { HskLevel, VOCABULARY_TABLE_NAME } from '../../common/constants/vocabulary.constant';
import { BaseEntity } from '../../shared/base.entity';

@Entity(VOCABULARY_TABLE_NAME)
export class Vocabulary extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  chinese: string;

  @Column({ type: 'varchar', length: 255 })
  pinyin: string;

  @Column({ name: 'vietnamese_meaning', type: 'varchar', length: 500 })
  vietnameseMeaning: string;

  @Column({ name: 'example_sentence', type: 'text', nullable: true })
  exampleSentence: string | null;

  @Column({ name: 'example_meaning', type: 'text', nullable: true })
  exampleMeaning: string | null;

  @Column({
    type: 'varchar',
    length: 10,
  })
  level: HskLevel;
}
