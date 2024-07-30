import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';
import { MessagesService } from './messages.service';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from '../auth/utils/ws/ws.guard';
import { Socket } from 'net';
import { CreateMessageDto } from './dto/create-message.dto';

@UseGuards(WsGuard)
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class MessagesGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly messagesService: MessagesService) {}
  @SubscribeMessage('messages')
  async handleMessage(
    @MessageBody() data: any,

    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const userId = client['user'].id;
    const createMessageDto: CreateMessageDto = data;
    await this.messagesService.create(
      { senderId: userId, receiverId: data.receiverId, chatId: data.chatId },
      createMessageDto,
    );
    return this.server.emit('messages', { ...data, senderId: userId });
  }
}
