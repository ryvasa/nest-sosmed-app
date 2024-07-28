import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ThreadsService } from '../threads/threads.service';

@Injectable()
export class DislikeThreadService {
  constructor(
    private prismaService: PrismaService,
    private threadService: ThreadsService,
  ) {}

  async checkDislikeThread(userId: string, threadId: string) {
    await this.threadService.findOne(threadId);
    const dislikedThread = await this.prismaService.thread_Dislike.findFirst({
      where: {
        user_id: userId,
        thread_id: threadId,
      },
    });
    return dislikedThread;
  }
  async create(userId: string, threadId: string) {
    const dislike = await this.checkDislikeThread(userId, threadId);
    if (dislike) {
      return { message: 'Already disliked' };
    }
    return this.prismaService.thread_Dislike.create({
      data: {
        user_id: userId,
        thread_id: threadId,
        dislike: true,
      },
    });
  }

  async remove(userId: string, threadId: string) {
    const dislike = await this.checkDislikeThread(userId, threadId);
    await this.prismaService.thread_Dislike.delete({
      where: {
        id: dislike.id,
      },
    });
    return { message: 'Dislike removed' };
  }
}
