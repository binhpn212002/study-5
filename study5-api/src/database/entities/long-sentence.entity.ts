import { Column, Entity, Index, Unique } from "typeorm";
import { SENTENCE_TABLE_NAME } from "../../common/constants/sentence.constant";
import { HskLevel } from "../../common/constants/vocabulary.constant";
import { BaseEntity } from "../../shared/base.entity";

@Entity(SENTENCE_TABLE_NAME)
@Unique("idx_long_sentences_vietnamese_level", ["vietnamese", "level"])
@Index("idx_long_sentences_level", ["level"])
export class LongSentence extends BaseEntity {
  @Column({ type: "varchar", length: 500 })
  vietnamese: string;

  @Column({ type: "varchar", length: 500 })
  chinese: string;

  @Column({ type: "varchar", length: 500 })
  pinyin: string;

  @Column({ type: "text" })
  meaning: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  hint: string | null;

  @Column({
    type: "varchar",
    length: 10,
  })
  level: HskLevel;
}
