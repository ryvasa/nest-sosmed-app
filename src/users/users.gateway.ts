import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from '../auth/utils/ws/ws.guard';
import { Socket, Server } from 'socket.io';
import { UsersService } from './users.service';

@UseGuards(WsGuard)
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class UsersGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly usersService: UsersService) {}

  @SubscribeMessage('setActive')
  async handleSetActive(@ConnectedSocket() socket: Socket) {
    const userId = socket['user']?.id;
    if (userId) {
      await this.usersService.setActiveToUser(userId);
      this.server.emit('setactive', { userId, active: true });
      this.resetActivityTimeout(userId);
    }
  }

  @SubscribeMessage('disconnect')
  async handleDisconnect(@ConnectedSocket() socket: Socket) {
    const userId = socket['user']?.id;
    if (userId) {
      await this.usersService.setNonActiveToUser(userId);
      this.server.emit('setactive', { userId, active: false });
    }
  }

  private userActivityTimeouts: Map<string, NodeJS.Timeout> = new Map();

  async handleActiveUser(socket: Socket, userId: string) {
    await this.usersService.setActiveToUser(userId);
    this.server.emit('setactive', { userId, active: true });
    console.log('first');

    // Reset the activity timeout
    this.resetActivityTimeout(userId);
  }

  async handleInactiveUser(userId: string) {
    await this.usersService.setNonActiveToUser(userId);
    this.server.emit('setactive', { userId, active: false });
  }

  resetActivityTimeout(userId: string) {
    if (this.userActivityTimeouts.has(userId)) {
      clearTimeout(this.userActivityTimeouts.get(userId));
    }

    const timeout = setTimeout(
      async () => {
        await this.handleInactiveUser(userId);
      },
      10 * 60 * 1000,
    ); // 10 minutes

    this.userActivityTimeouts.set(userId, timeout);
  }
}
