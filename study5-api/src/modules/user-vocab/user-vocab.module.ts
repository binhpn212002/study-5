import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserVocabulary } from '../../database/entities/user-vocabulary.entity';
import { UserVocabRepository } from './repositories/user-vocab.repository';
import { UserVocabService } from './services/user-vocab.service';
import { UserVocabController } from './user-vocab.controller';
import { AdminUserVocabController } from './admin-user-vocab.controller';
import { VocabularyModule } from '../vocabulary/vocabulary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserVocabulary]),
    VocabularyModule,
  ],
  controllers: [UserVocabController, AdminUserVocabController],
  providers: [UserVocabService, UserVocabRepository],
  exports: [UserVocabService],
})
export class UserVocabModule {}
