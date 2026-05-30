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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/user.constant';
import { SentenceService } from './services/sentence.service';
import { CreateSentenceDto } from './dto/create-sentence.dto';
import { UpdateSentenceDto } from './dto/update-sentence.dto';
import { ListSentenceQueryDto } from './dto/list-sentence-query.dto';
import { DetailSentenceParamDto } from './dto/detail-sentence-param.dto';

@ApiTags('sentences')
@ApiBearerAuth()
@Controller('sentences')
export class SentenceController {
  constructor(private readonly sentenceService: SentenceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new long sentence' })
  create(@Body() dto: CreateSentenceDto) {
    return this.sentenceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sentences with pagination' })
  findAll(@Query() query: ListSentenceQueryDto) {
    return this.sentenceService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sentence by ID' })
  findOne(@Param() param: DetailSentenceParamDto) {
    return this.sentenceService.findById(param.id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update sentence (full)' })
  update(
    @Param() param: DetailSentenceParamDto,
    @Body() dto: UpdateSentenceDto,
  ) {
    return this.sentenceService.update(param.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete sentence (soft-delete)' })
  remove(@Param() param: DetailSentenceParamDto) {
    return this.sentenceService.remove(param.id);
  }
}
