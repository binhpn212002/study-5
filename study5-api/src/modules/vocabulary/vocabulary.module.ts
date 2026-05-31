import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { TypeOrmModule } from "@nestjs/typeorm";
import { diskStorage } from "multer";
import { extname } from "path";
import { VOCABULARY_QUEUE_IMPORT } from "../../common/constants/vocabulary.constant";
import { Vocabulary } from "../../database/entities/vocabulary.entity";
import { VocabularyRepository } from "./repositories/vocabulary.repository";
import { VocabularyService } from "./services/vocabulary.service";
import { VocabularyController } from "./vocabulary.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Vocabulary]),
    BullModule.registerQueue({
      name: VOCABULARY_QUEUE_IMPORT,
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  ],
  controllers: [VocabularyController],
  providers: [VocabularyService, VocabularyRepository],
  exports: [VocabularyService],
})
export class VocabularyModule {}
