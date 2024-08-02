import {
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
