import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsUUID } from "class-validator";

export class SaveVocabularyDto {
  @ApiProperty({ description: "Vocabulary ID to save" })
  @IsNotEmpty()
  @IsUUID()
  vocabId: string;
  @ApiProperty({ description: "Is saved" })
  @IsNotEmpty()
  @IsBoolean()
  isSaved: boolean;
}
