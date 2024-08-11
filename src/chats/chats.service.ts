import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  async create(currentId: string, receiverId: string): Promise<any> {
    const isExsist = await this.checkExistingChat(currentId, receiverId);
    if (isExsist.exist) {
      return { id: isExsist.chatIds[0] };
    }
    const chat = await this.prismaService.chat.create({
      data: {},
    });
    if (currentId === receiverId) {
      throw new BadRequestException('Sendetr and Receiver can not same.');
    }
    [currentId, receiverId].forEach(async (user_id: string) => {
      await this.userService.findOne(user_id);
      await this.chatUserService.create(user_id, chat.id);
    });
    const createdchat = await this.findOne(chat.id);
    return createdchat;
  }

  async findAll({ userId, take, skip, username }) {
    const chats = await this.prismaService.chat.findMany({
      where: {
        AND: [
          { users: { some: { user: { username: { contains: username } } } } },
          { users: { some: { user_id: userId } } },
        ],
      },
      take,
      skip,
      select: {
        id: true,
        users: {
          select: {
            user: {
              select: { username: true, avatar: true, id: true, active: true },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: { readed: false, sender_id: { not: userId } },
            },
          },
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });
    return chats;
  }
  async checkExistingChat(currentId: string, receiverId: string) {
    // Cari semua chat yang dimiliki oleh currentId
    const chatsWithUser1 = await this.prismaService.chatUser.findMany({
      where: {
        user_id: currentId,
      },
      select: {
        chat_id: true,
      },
    });

    const chatIds = chatsWithUser1.map((chat) => chat.chat_id);

    // Cari chat yang juga dimiliki oleh receiverId dari daftar chat_id yang ditemukan
    const chatsWithUser2 = await this.prismaService.chatUser.findMany({
      where: {
        chat_id: {
          in: chatIds,
        },
        user_id: receiverId,
      },
      select: {
        chat_id: true,
      },
    });

    // Ambil daftar chat_id yang memenuhi syarat
    const chatIdsForBothUsers = chatsWithUser2.map((chat) => chat.chat_id);
    return {
      chatIds: chatIdsForBothUsers,
      exist: chatIdsForBothUsers.length > 0,
    };
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
    return chat;
  }

  async findOne(chatId: string): Promise<any> {
    const chat = await this.prismaService.chat.findFirst({
      where: {
        id: chatId,
      },
      include: {
        users: true,
        messages: {
          orderBy: { created_at: 'asc' },
        },
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
