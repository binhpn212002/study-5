import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "../../common/constants/user.constant";
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from "../../common/decorators/roles.decorator";
import { CreateVocabularyDto } from "./dto/create-vocabulary.dto";
import { DetailVocabularyParamDto } from './dto/detail-vocabulary-param.dto';
import { ListVocabularyQueryDto } from "./dto/list-vocabulary-query.dto";
import { UpdateVocabularyDto } from "./dto/update-vocabulary.dto";
import { VocabularyByLevelParamDto } from './dto/vocabulary-by-level-param.dto';
import { VocabularyService } from "./services/vocabulary.service";

@ApiTags("vocabularies")
@ApiBearerAuth()
@Controller("vocabularies")
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new vocabulary" })
  @ApiResponse({
    status: 201,
    description: "Vocabulary created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  create(@Body() dto: CreateVocabularyDto) {
    return this.vocabularyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Get all vocabularies with pagination" })
  @ApiResponse({
    status: 200,
    description: "List of vocabularies",
  })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  @ApiQuery({ name: "q", required: false, type: String, description: "Search by Chinese character or pinyin" })
  @ApiQuery({ name: "level", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "category", required: false, type: String, example: "food" })
  findAll(@Query() query: ListVocabularyQueryDto) {
    return this.vocabularyService.findAll(query);
  }

  @Get("levels")
  @Public()
  @ApiOperation({ summary: "Get all HSK levels with vocabulary counts" })
  @ApiResponse({
    status: 200,
    description: "List of HSK levels with counts",
  })
  getAllLevels() {
    return this.vocabularyService.getAllLevels();
  }

  @Get("by-level/:level")
  @ApiOperation({ summary: "Get vocabularies by HSK level" })
  @ApiResponse({
    status: 200,
    description: "List of vocabularies for the specified HSK level",
  })
  @ApiParam({ name: "level", type: Number, example: 1, description: "HSK level (1-6)" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 20 })
  findByLevel(@Param() param: VocabularyByLevelParamDto) {
    return this.vocabularyService.findByLevel(param.level);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get vocabulary by ID" })
  @ApiResponse({
    status: 200,
    description: "Vocabulary details",
  })
  @ApiResponse({ status: 404, description: "Vocabulary not found" })
  @ApiParam({ name: "id", type: Number, example: 1, description: "Vocabulary ID" })
  findOne(@Param() param: DetailVocabularyParamDto) {
    return this.vocabularyService.findById(param.id);
  }

  @Put(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update vocabulary (full)" })
  @ApiResponse({
    status: 200,
    description: "Vocabulary updated successfully",
  })
  @ApiResponse({ status: 404, description: "Vocabulary not found" })
  @ApiParam({ name: "id", type: Number, example: 1, description: "Vocabulary ID" })
  update(
    @Param() param: DetailVocabularyParamDto,
    @Body() dto: UpdateVocabularyDto,
  ) {
    return this.vocabularyService.update(param.id, dto);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update vocabulary (partial)" })
  @ApiResponse({
    status: 200,
    description: "Vocabulary updated successfully",
  })
  @ApiResponse({ status: 404, description: "Vocabulary not found" })
  @ApiParam({ name: "id", type: Number, example: 1, description: "Vocabulary ID" })
  partialUpdate(
    @Param() param: DetailVocabularyParamDto,
    @Body() dto: UpdateVocabularyDto,
  ) {
    return this.vocabularyService.update(param.id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Delete vocabulary (soft-delete)" })
  @ApiResponse({
    status: 204,
    description: "Vocabulary deleted successfully",
  })
  @ApiResponse({ status: 404, description: "Vocabulary not found" })
  @ApiParam({ name: "id", type: Number, example: 1, description: "Vocabulary ID" })
  remove(@Param() param: DetailVocabularyParamDto) {
    return this.vocabularyService.remove(param.id);
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
  import(@UploadedFile() file: { path: string }) {
    return this.vocabularyService.import(file);
  }
}
