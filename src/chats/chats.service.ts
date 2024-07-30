import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Chat } from '@prisma/client';
import { ChatUserService } from '../common/chat-user.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private readonly chatUserService: ChatUserService,
  ) {}
  async create(usersId: Array<string>): Promise<Chat> {
    const chat = await this.prismaService.chat.create({
      data: {},
    });
    usersId.forEach(async (user_id: string) => {
      await this.userService.findOne(user_id);
      await this.chatUserService.create(user_id, chat.id);
    });
    const createdchat = await this.findOne(chat.id);
    return createdchat;
  }

  async findAll(userId: string) {
    const chats = await this.prismaService.chat.findMany({
      where: {
        users: { some: { user_id: userId } },
      },
      include: {
        users: true,
      },
    });
    return chats;
  }

  async validateOwner(chatId: string, userId: string) {
    const chat = await this.prismaService.chat.findFirst({
      where: {
        id: chatId,
        users: {
          some: {
            user_id: userId,
          },
        },
      },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
  }

  async findOne(chatId: string): Promise<any> {
    const chat = await this.prismaService.chat.findFirst({
      where: {
        id: chatId,
      },
      include: {
        users: true,
        messages: true,
      },
    });
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }
    return chat;
  }

  async remove(id: string, userId: string) {
    await this.validateOwner(id, userId);
    await this.prismaService.chat.delete({
      where: {
        id,
        users: {
          some: {
            user_id: userId,
          },
        },
      },
    });
    return { message: 'Chat deleted' };
  }
}
