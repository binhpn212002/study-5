import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LongSentence } from "../database/entities/long-sentence.entity";
import { Vocabulary } from "../database/entities/vocabulary.entity";
import { SentenceModule } from "../modules/sentence/sentence.module";
import { VocabularyRepository } from "../modules/vocabulary/repositories/vocabulary.repository";
import { VocabularyModule } from "../modules/vocabulary/vocabulary.module";
import { ImportBackground } from "./import.worker";

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary, LongSentence]),
    VocabularyModule,
    SentenceModule,
  ],
  providers: [ImportBackground, VocabularyRepository],
  exports: [ImportBackground],
})
export class BackgroundModule {}
