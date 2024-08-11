import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { ActionType } from '@prisma/client';

interface Notifications {
  thread_id: string;
  sender_id: string;
  receiver_id: string;
  comment_id?: string;
  action: ActionType;
}
@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Notifications) {
    return await this.prismaService.notifications.create({
      data,
    });
  }

  async findAll(userId: string) {
    return await this.prismaService.notifications.findMany({
      where: {
        receiver_id: userId,
      },
      include: {
        sender: {
          select: {
            active: true,
            avatar: true,
            username: true,
            id: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async countNotification(userId: string) {
    return await this.prismaService.notifications.count({
      where: {
        receiver_id: userId,
        readed: false,
      },
    });
  }

  async setReadedAll(userId: string) {
    return await this.prismaService.notifications.updateMany({
      where: {
        receiver_id: userId,
      },
      data: {
        readed: true,
      },
    });
  }
  async authorCheck(notificationId: string, userId: string) {
    const result = await this.prismaService.notifications.findFirst({
      where: {
        AND: [
          { id: notificationId },
          {
            receiver_id: userId,
          },
        ],
      },
    });
    if (!result) {
      throw new UnauthorizedException('You are not allowed');
    }
  }
  async setReadedOne(notificationId: string, userId: string) {
    await this.authorCheck(notificationId, userId);
    return await this.prismaService.notifications.update({
      where: {
        id: notificationId,
      },
      data: {
        readed: true,
      },
    });
  }

  async remove(option: any) {
    return await this.prismaService.notifications.deleteMany({
      where: {
        AND: [option],
      },
    });
  }
}
