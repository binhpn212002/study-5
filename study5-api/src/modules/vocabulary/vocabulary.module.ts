import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from '../../database/entities/vocabulary.entity';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyRepository } from './repositories/vocabulary.repository';
import { VocabularyService } from './services/vocabulary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vocabulary])],
  controllers: [VocabularyController],
  providers: [VocabularyService, VocabularyRepository],
  exports: [VocabularyService],
})
export class VocabularyModule {}
