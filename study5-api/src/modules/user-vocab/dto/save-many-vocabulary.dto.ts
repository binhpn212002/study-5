import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNotEmpty, IsUUID, ArrayMinSize } from "class-validator";

export class SaveManyVocabularyDto {
  @ApiProperty({ description: "List of vocabulary IDs to save", type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID("4", { each: true })
  vocabIds: string[];

  @ApiProperty({ description: "Is saved", default: true })
  @IsNotEmpty()
  @IsBoolean()
  isSaved: boolean;
}
