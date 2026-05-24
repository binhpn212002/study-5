import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: number) {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findByUsername(username: string) {
    return this.usersRepository.findByUsername(username);
  }

  async findByEmailOrUsername(email: string, username: string) {
    return this.usersRepository.findOne({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.usersRepository.create(data);
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return this.usersRepository.update(id, data);
  }

  async delete(id: number) {
    return this.usersRepository.delete(id);
  }

  async exists(where: Prisma.UserWhereInput): Promise<boolean> {
    return this.usersRepository.exists(where);
  }

  async paginate(page: number, limit: number, where?: Prisma.UserWhereInput) {
    return this.usersRepository.paginate(page, limit, { where });
  }
}
