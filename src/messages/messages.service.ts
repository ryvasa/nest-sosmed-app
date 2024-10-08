import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ChatsService } from '../chats/chats.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.sto';
import { Message } from '@prisma/client';

interface MessageParams {
  sender_id: string;
  receiver_id: string;
  chat_id: string;
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatService: ChatsService,
  ) {}

  async create(
    { sender_id, receiver_id, chat_id }: MessageParams,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    await this.chatService.findOne(chat_id);
    if (sender_id === receiver_id) {
      throw new BadRequestException('Sendetr and Receiver can not same.');
    }
    const message = await this.prisma.message.create({
      data: {
        message: createMessageDto.message,
        sender_id,
        receiver_id,
        chat_id,
      },
    });
    return message;
  }

  async findManyByChatId(
    userid: string,
    chatId: string,
    take: number,
    skip: number,
  ): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        AND: {
          chat_id: chatId,
          OR: [{ sender_id: userid }, { receiver_id: userid }],
        },
      },
      include: {
        receiver: { select: { avatar: true, id: true, username: true } },
        sender: { select: { avatar: true, id: true, username: true } },
      },
      orderBy: { created_at: 'desc' },
      take,
      skip,
    });
    return messages;
  }

  async findOne(messageId: string): Promise<Message> {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
      },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    return message;
  }

  async countMessages(chat_id: string): Promise<number> {
    const message = await this.prisma.message.count({
      where: {
        chat_id,
      },
    });
    return message;
  }

  async validateAuthorMessage(
    messageId: string,
    userId: string,
  ): Promise<void> {
    const message = await this.findOne(messageId);
    if (message.sender_id !== userId) {
      throw new UnauthorizedException(
        'You are not allowed to delete this message',
      );
    }
  }

  async update(
    messageId: string,
    userId: string,
    messageBody: UpdateMessageDto,
  ): Promise<Message> {
    await this.validateAuthorMessage(messageId, userId);
    return this.prisma.message.update({
      where: {
        id: messageId,
      },
      data: {
        message: messageBody.message,
      },
    });
  }

  async remove(messageId: string, userId: string): Promise<any> {
    await this.validateAuthorMessage(messageId, userId);
    await this.prisma.message.delete({
      where: {
        id: messageId,
      },
    });
    return { message: 'Message deleted' };
  }

  async setReadedMessages(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatService.findOne(chatId);
    if (chat.messages.length > 0) {
      if (chat.messages[chat.messages.length - 1].sender_id !== userId) {
        await this.prisma.message.updateMany({
          where: {
            AND: [{ chat_id: chatId }, { readed: false }],
          },
          data: {
            readed: true,
          },
        });
      }
    }
  }

  async findUnreadedMessage(userId: string): Promise<any> {
    const messages = await this.prisma.message.count({
      where: {
        AND: [{ readed: false }, { receiver_id: userId }],
      },
    });
    return messages;
  }
}
