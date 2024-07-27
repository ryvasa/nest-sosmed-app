import { Injectable } from '@nestjs/common';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { Thread } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ThreadsService {
  constructor(private prismaService: PrismaService) {}

  async create(
    userId: string,
    createThreadDto: CreateThreadDto,
  ): Promise<Thread> {
    const thread = await this.prismaService.thread.create({
      data: { user_id: userId, ...createThreadDto },
    });
    return thread;
  }

  findAll() {
    return `This action returns all threads`;
  }

  findOne(id: number) {
    return `This action returns a #${id} thread`;
  }

  update(id: number, updateThreadDto: UpdateThreadDto) {
    return { msg: `This action updates a #${id} thread`, updateThreadDto };
  }

  remove(id: number) {
    return `This action removes a #${id} thread`;
  }
}
