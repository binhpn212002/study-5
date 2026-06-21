import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { QUEUE_IMPORT } from "../../common/constants/hsk.constant";
import { LongSentence } from "../../database/entities/long-sentence.entity";
import { SentenceRepository } from "./repositories/sentence.repository";
import { SentenceController } from "./sentence.controller";
import { SentenceService } from "./services/sentence.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([LongSentence]),
    BullModule.registerQueue({ name: QUEUE_IMPORT }),
  ],
  controllers: [SentenceController],
  providers: [SentenceService, SentenceRepository],
  exports: [SentenceService, SentenceRepository],
})
export class SentenceModule {}
