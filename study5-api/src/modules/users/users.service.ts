import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UserRepository } from './users.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: number) {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findByUsername(username: string) {
    return this.userRepository.findByUsername(username);
  }

  async findByEmailOrUsername(email: string, username: string) {
    return this.userRepository.findOne({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return this.userRepository.create(data);
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return this.userRepository.update(id, data);
  }

  async delete(id: number) {
    return this.userRepository.delete(id);
  }

  async exists(where: Prisma.UserWhereInput): Promise<boolean> {
    return this.userRepository.exists(where);
  }

  async paginate(page: number, limit: number, where?: Prisma.UserWhereInput) {
    return this.userRepository.paginate(page, limit, { where });
  }
}
