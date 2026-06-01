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
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from "../../common/constants/user.constant";
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from "../../common/decorators/roles.decorator";
import { ListResponseDto } from "../../common/dto/list-response.dto";
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { DetailUserVocabParamDto } from "./dto/detail-user-vocab-param.dto";
import { ListUserVocabQueryDto } from "./dto/list-user-vocab-query.dto";
import { UserVocabResponseDto } from "./dto/response/user-vocab-response.dto";
import { SaveVocabularyDto } from './dto/save-vocabulary.dto';
import { SaveManyVocabularyDto } from './dto/save-many-vocabulary.dto';
import { UpdateVocabStatusDto } from './dto/update-vocab-status.dto';
import { UserVocabService } from "./services/user-vocab.service";

@ApiTags("UserVocabulary")
@ApiBearerAuth()
@Controller("user-vocab")
export class UserVocabController {
  constructor(private readonly userVocabService: UserVocabService) {}

  @Post("save")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Save a vocabulary to user list" })
  @Roles(UserRole.USER)
  async save(
    @CurrentUser() user: AuthUser,
    @Body() dto: SaveVocabularyDto,
  ): Promise<UserVocabResponseDto> {
    return this.userVocabService.save(user.userId, dto);
  }

  @Post("save-many")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Save multiple vocabularies to user list" })
  @Roles(UserRole.USER)
  async saveMany(
    @CurrentUser() user: AuthUser,
    @Body() dto: SaveManyVocabularyDto,
  ): Promise<{ savedCount: number }> {
    return this.userVocabService.saveMany(user.userId, dto);
  }

  @Delete("remove/:vocabId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a vocabulary from user list (soft remove)" })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param() param: DetailUserVocabParamDto,
  ): Promise<void> {
    return this.userVocabService.remove(user.userId, param.vocabId);
  }

  @Get()
  @ApiOperation({ summary: "Get all saved vocabularies for current user" })
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: ListUserVocabQueryDto,
  ): Promise<ListResponseDto<UserVocabResponseDto>> {
    return this.userVocabService.findAll(user.userId, query);
  }

  @Get(":vocabId")
  @ApiOperation({ summary: "Get a specific saved vocabulary" })
  @Roles(UserRole.USER)
  async findOne(
    @CurrentUser() user: AuthUser,
    @Param() param: DetailUserVocabParamDto,
  ): Promise<UserVocabResponseDto> {
    return this.userVocabService.findByVocabId(user.userId, param.vocabId);
  }

  @Patch(":vocabId/status")
  @Roles(UserRole.USER)
  @ApiOperation({ summary: "Update vocabulary learning status" })
  async updateStatus(
    @CurrentUser() user: AuthUser,
    @Param() param: DetailUserVocabParamDto,
    @Body() dto: UpdateVocabStatusDto,
  ): Promise<UserVocabResponseDto> {
    return this.userVocabService.updateStatus(user.userId, param.vocabId, dto);
  }
}
