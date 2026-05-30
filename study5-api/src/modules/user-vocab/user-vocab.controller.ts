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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { UserVocabService } from './services/user-vocab.service';
import { SaveVocabularyDto } from './dto/save-vocabulary.dto';
import { UpdateVocabStatusDto } from './dto/update-vocab-status.dto';
import { ListUserVocabQueryDto } from './dto/list-user-vocab-query.dto';
import { DetailUserVocabParamDto } from './dto/detail-user-vocab-param.dto';
import { UserVocabResponseDto } from './dto/response/user-vocab-response.dto';
import { ListResponseDto } from '../../common/dto/list-response.dto';

@ApiTags('UserVocabulary')
@ApiBearerAuth()
@Controller('user-vocab')
export class UserVocabController {
  constructor(private readonly userVocabService: UserVocabService) {}

  @Post('save')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a vocabulary to user list' })
  async save(
    @CurrentUser() user: AuthUser,
    @Body() dto: SaveVocabularyDto,
  ): Promise<UserVocabResponseDto> {
    return this.userVocabService.save(user.userId, dto);
  }

  @Delete('remove/:vocabId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a vocabulary from user list (soft remove)' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param() param: DetailUserVocabParamDto,
  ): Promise<void> {
    return this.userVocabService.remove(user.userId, param.vocabId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all saved vocabularies for current user' })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: ListUserVocabQueryDto,
  ): Promise<ListResponseDto<UserVocabResponseDto>> {
    return this.userVocabService.findAll(user.userId, query);
  }

  @Get(':vocabId')
  @ApiOperation({ summary: 'Get a specific saved vocabulary' })
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param() param: DetailUserVocabParamDto,
  ): Promise<UserVocabResponseDto> {
    return this.userVocabService.findByVocabId(user.userId, param.vocabId);
  }

  @Patch(':vocabId/status')
  @ApiOperation({ summary: 'Update vocabulary learning status' })
  async updateStatus(
    @CurrentUser() user: AuthUser,
    @Param() param: DetailUserVocabParamDto,
    @Body() dto: UpdateVocabStatusDto,
  ): Promise<UserVocabResponseDto> {
    return this.userVocabService.updateStatus(user.userId, param.vocabId, dto);
  }
}
