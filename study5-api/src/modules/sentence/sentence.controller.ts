import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "../../common/constants/user.constant";
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateSentenceDto } from "./dto/create-sentence.dto";
import { DetailSentenceParamDto } from "./dto/detail-sentence-param.dto";
import { ListSentenceQueryDto } from "./dto/list-sentence-query.dto";
import { UpdateSentenceDto } from "./dto/update-sentence.dto";
import { SentenceService } from "./services/sentence.service";

@ApiTags("sentences")
@ApiBearerAuth()
@Controller("sentences")
export class SentenceController {
  constructor(private readonly sentenceService: SentenceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Create a new long sentence" })
  create(@Body() dto: CreateSentenceDto) {
    return this.sentenceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all sentences with pagination" })
  findAll(@Query() query: ListSentenceQueryDto) {
    return this.sentenceService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get sentence by ID" })
  findOne(@Param() param: DetailSentenceParamDto) {
    return this.sentenceService.findById(param.id);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update sentence (full)" })
  update(
    @Param() param: DetailSentenceParamDto,
    @Body() dto: UpdateSentenceDto,
  ) {
    return this.sentenceService.update(param.id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Delete sentence (soft-delete)" })
  remove(@Param() param: DetailSentenceParamDto) {
    return this.sentenceService.remove(param.id);
  }

  @UseInterceptors(FileInterceptor("file"))
  @Post("import")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Import vocabularies from CSV" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "CSV file containing vocabularies",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Vocabularies imported successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid CSV file" })
  import(@UploadedFile() file: { buffer: Buffer }) {
    return this.sentenceService.import(file.buffer);
  }
}