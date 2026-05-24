import { Prisma } from '@prisma/client';
import { BaseRepository } from '../../database/repositories/base.repository';

export class UsersRepository extends BaseRepository {
  protected readonly modelName = 'user' as const;

  async findByEmail(
    email: string,
    options?: { select?: unknown; include?: unknown },
  ): Promise<Prisma.UserGetPayload<object> | null> {
    return this.findOne({
      where: { email },
      select: options?.select,
      include: options?.include,
    });
  }

  async findByUsername(
    username: string,
    options?: { select?: unknown; include?: unknown },
  ): Promise<Prisma.UserGetPayload<object> | null> {
    return this.findOne({
      where: { username },
      select: options?.select,
      include: options?.include,
    });
  }
}
