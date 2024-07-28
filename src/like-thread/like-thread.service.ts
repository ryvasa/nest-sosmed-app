import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ThreadsService } from '../threads/threads.service';

@Injectable()
export class LikeThreadService {
  constructor(
    private prismaService: PrismaService,
    private threadService: ThreadsService,
  ) {}

  async checkLikeThread(userId: string, threadId: string) {
    await this.threadService.findOne(threadId);
    const likedThread = await this.prismaService.thread_Like.findFirst({
      where: {
        user_id: userId,
        thread_id: threadId,
      },
    });
    return likedThread;
  }
  async create(userId: string, threadId: string) {
    const like = await this.checkLikeThread(userId, threadId);
    if (like) {
      return { message: 'Already liked' };
    }
    return this.prismaService.thread_Like.create({
      data: {
        user_id: userId,
        thread_id: threadId,
        like: true,
      },
    });
  }

  async remove(userId: string, threadId: string) {
    const like = await this.checkLikeThread(userId, threadId);
    await this.prismaService.thread_Like.delete({
      where: {
        id: like.id,
      },
    });
    return { message: 'like removed' };
  }
}
