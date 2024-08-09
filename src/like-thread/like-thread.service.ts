import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ThreadsService } from '../threads/threads.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActionType } from '@prisma/client';

@Injectable()
export class LikeThreadService {
  constructor(
    private prismaService: PrismaService,
    private threadService: ThreadsService,
    private notificationService: NotificationsService,
  ) {}

  async checkLikeThread(userId: string, threadId: string) {
    await this.threadService.findOne(threadId);
    const likedThread = await this.prismaService.thread_Like.findFirst({
      where: {
        user_id: userId,
        thread_id: threadId,
      },
      include: {
        thread: true,
      },
    });
    return likedThread;
  }
  async create(userId: string, threadId: string) {
    const like = await this.checkLikeThread(userId, threadId);
    if (like) {
      return { message: 'Already liked' };
    }
    const result = await this.prismaService.thread_Like.create({
      data: {
        user_id: userId,
        thread_id: threadId,
        like: true,
      },
      include: {
        thread: true,
      },
    });
    const data = {
      receiver_id: result.thread.user_id,
      sender_id: userId,
      action: 'LIKE' as ActionType,
      thread_id: threadId,
    };
    await this.notificationService.create(data);
    return result;
  }

  async remove(userId: string, threadId: string) {
    const like = await this.checkLikeThread(userId, threadId);
    await this.prismaService.thread_Like.delete({
      where: {
        id: like.id,
      },
    });

    const option = {
      receiver_id: like.thread.user_id,
      sender_id: userId,
      action: 'LIKE' as ActionType,
      thread_id: threadId,
    };
    await this.notificationService.remove(option);
    return { message: 'like removed' };
  }
}
