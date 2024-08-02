import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('notify')
  handleNotify(
    @MessageBody() room: any,
    @ConnectedSocket() socket: Socket,
  ): void {
    console.log(room);
    this.server.emit('notify', { message: 'hi from room' + room });
  }
}
