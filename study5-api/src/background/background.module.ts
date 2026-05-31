import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vocabulary } from "../database/entities/vocabulary.entity";
import { VocabularyRepository } from "../modules/vocabulary/repositories/vocabulary.repository";
import { VocabularyModule } from "../modules/vocabulary/vocabulary.module";
import { VocabularyBackground } from "./vocabulary";

@Module({
  imports: [TypeOrmModule.forFeature([Vocabulary]), VocabularyModule],
  providers: [VocabularyBackground, VocabularyRepository],
  exports: [VocabularyBackground],
})
export class BackgroundModule {}
