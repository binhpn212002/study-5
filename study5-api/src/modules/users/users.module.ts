import { Module } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { UserService } from './users.service';
@Module({
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
