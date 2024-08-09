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
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class NotificationsGateway {
  constructor(private readonly notificationsService: NotificationsService) {}

  @WebSocketServer()
  server: Server;
  @SubscribeMessage('notify')
  handleNotify(
    @MessageBody() room: any,
    // @ConnectedSocket() socket: Socket,
  ): void {
    this.server.emit('notify', { message: 'hi from room' + room });
  }

  @SubscribeMessage('thread-notify')
  async handleThreadNotification(
    @ConnectedSocket() socket: Socket,
  ): Promise<any> {
    const userId = socket['user']?.id;
    console.log(userId);
    const notification =
      await this.notificationsService.countNotification(userId);
    this.server.emit('thread-notify', notification);
  }
}
