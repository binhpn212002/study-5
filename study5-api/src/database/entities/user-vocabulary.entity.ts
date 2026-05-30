import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { USER_VOCABULARY_TABLE_NAME } from '../../common/constants/hsk.constant';
import { VocabStatus } from '../../common/constants/vocab-status.constant';
import { HskLevel } from '../../common/constants/vocabulary.constant';
import { BaseEntity } from '../../shared/base.entity';
import { User } from './user.entity';
import { Vocabulary } from './vocabulary.entity';

@Entity(USER_VOCABULARY_TABLE_NAME)
@Unique(['userId', 'vocabId'])
export class UserVocabulary extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'vocab_id', type: 'uuid' })
  vocabId: string;

  @Column({ name: 'is_saved', type: 'boolean', default: true })
  isSaved: boolean;

  @Column({
    type: 'varchar',
    length: 20,
    default: VocabStatus.NEW,
  })
  status: VocabStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Vocabulary)
  @JoinColumn({ name: 'vocab_id' })
  vocabulary: Vocabulary;
}
