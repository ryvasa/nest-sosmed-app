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
  namespace: 'messages',
  cors: {
    origin: process.env.CONSUME_URL,
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
    // console.log(`Socket ${socket.id} joined room ${room}`);
    socket.join(room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log(`Socket ${socket.id} left room ${room}`);
    socket.leave(room);
  }

  // not impleented yet
  @SubscribeMessage('checkRoom')
  handleCheckRoom(client: Socket, room: string) {
    const rooms = Array.from(client.rooms);
    const inRoom = rooms.includes(room);
    // console.log('roomStatus', { room, inRoom });
    this.server.emit('roomStatus', { room, inRoom });
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    const userId = socket['user'].id;
    const createMessageDto: CreateMessageDto = data;
    const createdMessage = await this.messagesService.create(
      {
        sender_id: userId,
        receiver_id: data.receiver_id,
        chat_id: data.chat_id,
      },
      createMessageDto,
    );
    this.server.to(data.chat_id).emit('notify');
    this.server.in(data.chat_id).emit('message', createdMessage);

    // console.log('Message sent:', messageToSend);
    // console.log('Rooms:', this.server.sockets.adapter.rooms);
  }

  @SubscribeMessage('readMessage')
  async handleReadMessage(
    @MessageBody() room: string,
    @ConnectedSocket() socket: Socket,
  ) {
    // console.log(`readed message  room ${room}`);
    const userId = socket['user'].id;
    await this.messagesService.setReadedMessages(room, userId);
    this.server
      .in(room)
      .emit('readMessage', { message: 'message readed' + room });
  }

  @SubscribeMessage('notify')
  handleNotify(
    @MessageBody() room: any,
    // @ConnectedSocket() socket: Socket,
  ): void {
    this.server.emit('notify', { message: 'hi from room' + room });
  }
}
