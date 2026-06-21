import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Worker as BullWorker, Job } from "bullmq";
import {
  IMPORT_TYPE_SENTENCE,
  IMPORT_TYPE_VOCABULARY,
  QUEUE_IMPORT,
} from "../common/constants/hsk.constant";
import { HskLevel } from "../common/constants/vocabulary.constant";
import { SentenceRepository } from "../modules/sentence/repositories/sentence.repository";
import { VocabularyRepository } from "../modules/vocabulary/repositories/vocabulary.repository";
const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379", 10),
};

@Injectable()
export class ImportBackground implements OnModuleInit, OnModuleDestroy {
  private worker: BullWorker;

  constructor(
    private readonly vocabularyRepository: VocabularyRepository,
    private readonly sentenceRepository: SentenceRepository,
  ) {}

  onModuleInit() {
    console.log("[ImportBackground] Starting BullMQ worker...");
    this.worker = new BullWorker(
      QUEUE_IMPORT,
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
    switch (job.data.type) {
      case IMPORT_TYPE_VOCABULARY:
        return this.importVocabulary(job.data.rows);

      case IMPORT_TYPE_SENTENCE:
        return this.importSentence(job.data.rows);
      default:
        throw new Error(`Unsupported import type: ${job.data.type}`);
    }
  }

  async importSentence(rows: Record<string, string>[]): Promise<any> {
    console.log("[SentenceBackground] Starting import sentence:");
    console.log("[SentenceBackground] Rows count:", rows?.length);

    const errors: string[] = [];
    let skipped = 0;
    let total = 0;
    try {
      if (!rows || rows.length === 0) {
        console.log("[SentenceBackground] No rows to process");
        return { total: 0, skipped: 0, errors: [] };
      }
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // Normalize field names (CSV headers are lowercase, no spaces)
        const normalizedRow = {
          chinese:
            row.chinese ?? row["chinese"] ?? row["中文"] ?? row["Chinese"],
          pinyin: row.pinyin ?? row["pinyin"] ?? row["拼音"] ?? row["Pinyin"],
          vietnamese:
            row.vietnamese ??
            row["vietnamese"] ??
            row["越南语"] ??
            row["Vietnamese"],
          meaning:
            row.meaning ?? row["meaning"] ?? row["意思"] ?? row["Meaning"],
          hint: row.hint ?? row["hint"] ?? row["提示"] ?? row["Hint"],
          level: row.level ?? row["level"] ?? row["等级"] ?? row["Level"],
        };

        // check existing
        const existingSentence = await this.sentenceRepository.findByVietnamese(
          normalizedRow.vietnamese,
        );
        if (existingSentence) {
          errors.push(
            `Row ${i}: Duplicate 'vietnamese' value: ${normalizedRow.vietnamese}`,
          );
          skipped++;
          continue;
        }

        // validate required fields
        if (
          !normalizedRow.vietnamese ||
          !normalizedRow.chinese ||
          !normalizedRow.pinyin ||
          !normalizedRow.meaning ||
          !normalizedRow.level
        ) {
          errors.push(
            `Row ${i}: Required fields are missing - vietnamese: '${normalizedRow.vietnamese}', chinese: '${normalizedRow.chinese}', pinyin: '${normalizedRow.pinyin}', meaning: '${normalizedRow.meaning}', level: '${normalizedRow.level}'`,
          );
          skipped++;
          continue;
        }

        // create sentence
        const sentence = this.sentenceRepository.create({
          vietnamese: normalizedRow.vietnamese,
          chinese: normalizedRow.chinese,
          pinyin: normalizedRow.pinyin,
          meaning: normalizedRow.meaning,
          hint: normalizedRow.hint || null,
          level: normalizedRow.level as HskLevel,
        });
        console.log("[SentenceBackground] Sentence created:", sentence);
        console.log("[SentenceBackground] Saving sentence...");
        await this.sentenceRepository.save(sentence);
        total++;
      }

      console.log(
        `[SentenceBackground] Successfully processed ${total} rows, skipped: ${skipped}`,
      );

      console.log("[SentenceBackground] Errors:", errors);
      return { total, skipped, errors };
    } catch (error) {
      console.error("[SentenceBackground] Error processing job:", error);
      throw error;
    }
  }

  async importVocabulary(rows: Record<string, string>[]): Promise<any> {
    console.log("[VocabularyBackground] Starting import vocabulary:");
    console.log("[VocabularyBackground] Rows count:", rows?.length);
    const errors: string[] = [];
    let skipped = 0;
    let total = 0;

    try {
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
          level: normalizedRow.level as HskLevel,
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
