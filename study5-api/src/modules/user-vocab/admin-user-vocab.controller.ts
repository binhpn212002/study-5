import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../../common/constants/user.constant';
import { UserVocabService } from './services/user-vocab.service';
import { ListUserVocabQueryDto } from './dto/list-user-vocab-query.dto';
import { UserVocabResponseDto } from './dto/response/user-vocab-response.dto';
import { ListResponseDto } from '../../common/dto/list-response.dto';

@ApiTags('Admin/UserVocabulary')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/user-vocab')
export class AdminUserVocabController {
  constructor(private readonly userVocabService: UserVocabService) {}

  @Get()
  @ApiOperation({ summary: 'Get all user vocabularies (Admin only)' })
  async findAll(
    @Query() query: ListUserVocabQueryDto,
  ): Promise<ListResponseDto<UserVocabResponseDto>> {
    return this.userVocabService.findAllAdmin(query);
  }
}
