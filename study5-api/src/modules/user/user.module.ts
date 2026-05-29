import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../database/entities/user.entity';
import { FirebaseAdminService } from '../auth/services/firebase-admin.service';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    JwtAuthGuard,
    FirebaseAdminService,
  ],
  exports: [UsersService, UsersRepository, JwtAuthGuard],
})
export class UserModule {}
