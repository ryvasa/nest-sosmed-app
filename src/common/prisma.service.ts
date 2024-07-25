import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
    console.log('Create Prisma Service');
  }

  onModuleInit() {
    console.info('Connect Prisma');
    this.$connect();
  }

  onModuleDestroy() {
    console.info('Disconnect Prisma');
    this.$disconnect();
  }
}
