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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/user.constant';
import { VocabularyService } from './services/vocabulary.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { ListVocabularyQueryDto } from './dto/list-vocabulary-query.dto';
import { DetailVocabularyParamDto } from './dto/detail-vocabulary-param.dto';
import { VocabularyByLevelParamDto } from './dto/vocabulary-by-level-param.dto';

@ApiTags('vocabularies')
@ApiBearerAuth()
@Controller('vocabularies')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new vocabulary' })
  create(@Body() dto: CreateVocabularyDto) {
    return this.vocabularyService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vocabularies with pagination' })
  findAll(@Query() query: ListVocabularyQueryDto) {
    return this.vocabularyService.findAll(query);
  }

  @Get('levels')
  @Public()
  @ApiOperation({ summary: 'Get all HSK levels with vocabulary counts' })
  getAllLevels() {
    return this.vocabularyService.getAllLevels();
  }

  @Get('by-level/:level')
  @ApiOperation({ summary: 'Get vocabularies by HSK level' })
  findByLevel(@Param() param: VocabularyByLevelParamDto) {
    return this.vocabularyService.findByLevel(param.level);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vocabulary by ID' })
  findOne(@Param() param: DetailVocabularyParamDto) {
    return this.vocabularyService.findById(param.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update vocabulary (full)' })
  update(
    @Param() param: DetailVocabularyParamDto,
    @Body() dto: UpdateVocabularyDto,
  ) {
    return this.vocabularyService.update(param.id, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update vocabulary (partial)' })
  partialUpdate(
    @Param() param: DetailVocabularyParamDto,
    @Body() dto: UpdateVocabularyDto,
  ) {
    return this.vocabularyService.update(param.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete vocabulary (soft-delete)' })
  remove(@Param() param: DetailVocabularyParamDto) {
    return this.vocabularyService.remove(param.id);
  }
}
