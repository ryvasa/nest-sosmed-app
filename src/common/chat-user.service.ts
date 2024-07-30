import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ChatUserService {
  constructor(private prismaService: PrismaService) {}

  async create(userId: string, chatId: string) {
    return this.prismaService.chatUser.create({
      data: {
        user_id: userId,
        chat_id: chatId,
      },
    });
  }
}
