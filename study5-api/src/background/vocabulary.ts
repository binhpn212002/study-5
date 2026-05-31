import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Worker as BullWorker, Job } from "bullmq";
import { VocabularyRepository } from "../modules/vocabulary/repositories/vocabulary.repository";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
};

@Injectable()
export class VocabularyBackground implements OnModuleInit, OnModuleDestroy {
  private worker: BullWorker;

  constructor(private readonly vocabularyRepository: VocabularyRepository) {}

  onModuleInit() {
    console.log("[VocabularyBackground] Starting BullMQ worker...");
    this.worker = new BullWorker(
      "vocabulary-import-queue",
      async (job: Job) => this.process(job),
      { connection },
    );
    this.worker.on("completed", (job) => {
      console.log(`[VocabularyBackground] Job ${job.id} completed`);
    });
    this.worker.on("failed", (job, err) => {
      console.error(
        `[VocabularyBackground] Job ${job?.id} failed:`,
        err.message,
      );
    });
    console.log("[VocabularyBackground] Worker started ✅");
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    console.log("[VocabularyBackground] Starting job:", job.id);
    console.log(
      "[VocabularyBackground] Job data rows count:",
      job.data.rows?.length,
    );
    if (job.data.rows?.length > 0) {
      console.log(
        "[VocabularyBackground] Sample row 0 keys:",
        Object.keys(job.data.rows[0]),
      );
      console.log(
        "[VocabularyBackground] Sample row 0 values:",
        JSON.stringify(job.data.rows[0], null, 2),
      );
    }
    const errors: string[] = [];
    let skipped = 0;
    let total = 0;
    const BATCH_SIZE = 50;

    try {
      const { rows } = job.data;
      if (!rows || rows.length === 0) {
        console.log("[VocabularyBackground] No rows to process");
        return { total: 0, skipped: 0, errors: [] };
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // Normalize field names (CSV headers are lowercase, no spaces)
        const normalizedRow = {
          chinese:
            row.chinese ?? row["chinese"] ?? row["中文"] ?? row["Chinese"],
          pinyin: row.pinyin ?? row["pinyin"] ?? row["拼音"] ?? row["Pinyin"],
          vietnameseMeaning:
            row.vietnameseMeaning ??
            row.vietnamesemeaning ??
            row["vietnamese meaning"] ??
            row["VietnameseMeaning"] ??
            row["meaning"],
          exampleSentence:
            row.exampleSentence ??
            row["example sentence"] ??
            row["ExampleSentence"],
          exampleMeaning:
            row.exampleMeaning ??
            row["example meaning"] ??
            row["ExampleMeaning"],
          level: row.level ?? row["Level"],
        };

        // check existing
        const existingVocabulary =
          await this.vocabularyRepository.findByChinese(normalizedRow.chinese);
        if (existingVocabulary) {
          errors.push(
            `Row ${i}: Duplicate 'chinese' value: ${normalizedRow.chinese}`,
          );
          skipped++;
          continue;
        }

        //validate required fields
        if (
          !normalizedRow.chinese ||
          !normalizedRow.pinyin ||
          !normalizedRow.vietnameseMeaning ||
          !normalizedRow.level
        ) {
          errors.push(
            `Row ${i}: Required fields are missing - chinese: '${normalizedRow.chinese}', pinyin: '${normalizedRow.pinyin}', meaning: '${normalizedRow.vietnameseMeaning}', level: '${normalizedRow.level}'`,
          );
          skipped++;
          continue;
        }

        // create vocabulary
        const vocabulary = this.vocabularyRepository.create({
          chinese: normalizedRow.chinese,
          pinyin: normalizedRow.pinyin,
          vietnameseMeaning: normalizedRow.vietnameseMeaning,
          exampleSentence: normalizedRow.exampleSentence || null,
          exampleMeaning: normalizedRow.exampleMeaning || null,
          level: normalizedRow.level,
        });
        console.log("[VocabularyBackground] Vocabulary created:", vocabulary);
        console.log("[VocabularyBackground] Saving vocabulary...");
        await this.vocabularyRepository.save(vocabulary);
        total++;
      }

      console.log(
        `[VocabularyBackground] Successfully processed ${total} rows, skipped: ${skipped}`,
      );

      console.log("[VocabularyBackground] Errors:", errors);
      return { total, skipped, errors };
    } catch (error) {
      console.error("[VocabularyBackground] Error processing job:", error);
      throw error;
    }
  }
}
