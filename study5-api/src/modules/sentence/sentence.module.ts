import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LongSentence } from '../../database/entities/long-sentence.entity';
import { SentenceController } from './sentence.controller';
import { SentenceRepository } from './repositories/sentence.repository';
import { SentenceService } from './services/sentence.service';

@Module({
  imports: [TypeOrmModule.forFeature([LongSentence])],
  controllers: [SentenceController],
  providers: [SentenceService, SentenceRepository],
  exports: [SentenceService],
})
export class SentenceModule {}
