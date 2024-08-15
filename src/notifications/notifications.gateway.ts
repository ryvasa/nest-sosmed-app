import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from '../auth/utils/ws/ws.guard';

@UseGuards(WsGuard)
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: process.env.CONSUME_URL,
    credentials: true,
  },
})
export class NotificationsGateway {
  constructor(private readonly notificationsService: NotificationsService) {}

  @SubscribeMessage('join-notification-room')
  async handleJoinRoom(
    @MessageBody() room: string,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(`Socket ${socket.id} joined notifications room ${room}`);
    socket.join(room);
  }

  @SubscribeMessage('leave-notification-room')
  handleLeaveRoom(
    @MessageBody() room: string,
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(`Socket ${socket.id} left notifications room ${room}`);
    socket.leave(room);
  }

  // not implement yet
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('notify')
  handleNotify() // @MessageBody() room: any,
  // @ConnectedSocket() socket: Socket,
  : void {
    this.server.emit('notify');
  }

  @SubscribeMessage('thread-notify')
  async handleThreadNotification(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room: any,
  ): Promise<any> {
    this.server.to(room).emit('thread-notify');
  }

  @SubscribeMessage('comment-notify')
  async handleComentNotification(
    @ConnectedSocket() socket: Socket,
    @MessageBody() room: any,
  ): Promise<any> {
    // const userId = socket['user']?.id;
    this.server.to(room).emit('comment-notify');
  }
}
