import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prismaClient } from './client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  get client() {
    return prismaClient;
  }

  async onModuleInit() {
    await prismaClient.$connect();
  }

  async onModuleDestroy() {
    await prismaClient.$disconnect();
  }
}
