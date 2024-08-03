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
  namespace: 'users',
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
})
export class UsersGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly usersService: UsersService) {}

  @SubscribeMessage('active')
  async handleActive(@ConnectedSocket() socket: Socket) {
    const userId = socket['user']?.id;
    console.log('active', userId);
    if (userId) {
      await this.usersService.setActiveToUser(userId);
      this.server.emit('activeStatus', { userId, active: true });
      this.resetActivityTimeout(userId);
    }
  }

  @SubscribeMessage('inactive')
  async handleInactive(@ConnectedSocket() socket: Socket) {
    const userId = socket['user']?.id;
    console.log('disconnected', userId);
    if (userId) {
      await this.usersService.setNonActiveToUser(userId);
      this.server.emit('activeStatus', { userId, active: false });
    }
  }

  private userActivityTimeouts: Map<string, NodeJS.Timeout> = new Map();

  async handleActiveUser(socket: Socket, userId: string) {
    await this.usersService.setActiveToUser(userId);
    this.server.emit('activeStatus', { userId, active: true });

    // Reset the activity timeout
    this.resetActivityTimeout(userId);
  }

  async handleInactiveUser(userId: string) {
    await this.usersService.setNonActiveToUser(userId);
    this.server.emit('activeStatus', { userId, active: false });
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
