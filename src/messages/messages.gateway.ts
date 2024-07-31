import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from '../auth/utils/ws/ws.guard';
import { Socket, Server } from 'socket.io';
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

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(`Socket ${socket.id} joined room ${room}`);
    await this.messagesService.setReadedMessages(room);
    socket.join(room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(`Socket ${socket.id} left room ${room}`);
    socket.leave(room);
  }

  @SubscribeMessage('messages')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    const userId = socket['user'].id;
    const createMessageDto: CreateMessageDto = data;
    await this.messagesService.create(
      {
        sender_id: userId,
        receiver_id: data.receiver_id,
        chat_id: data.chat_id,
      },
      createMessageDto,
    );
    const messageToSend = { ...data, sender_id: userId };
    this.server.to(data.chat_id).emit('messages', messageToSend);

    console.log('Message sent:', messageToSend);
    console.log('Rooms:', this.server.sockets.adapter.rooms);
  }
}
