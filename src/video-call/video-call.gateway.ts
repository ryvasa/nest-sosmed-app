import { UseGuards } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsGuard } from 'src/auth/utils/ws/ws.guard';
import { VideoCallService } from './video-call.service';

@UseGuards(WsGuard)
@WebSocketGateway({
  namespace: 'calls',
  cors: {
    origin: process.env.CONSUME_URL,
    credentials: true,
  },
})
export class VideoCallGateway {
  @WebSocketServer()
  server: Server;
  constructor(private readonly videoCallService: VideoCallService) {}

  @SubscribeMessage('call')
  async handleCall(
    @ConnectedSocket() socket: Socket,
    // @MessageBody() room: string,
  ) {
    const userId = socket['user'].id;
    await this.videoCallService.addSocketId({ key: userId, value: socket.id });
    this.server.to(socket.id).emit('me', socket.id);
    console.log({ socket: socket.id, userId });
    return { userId };
  }

  @SubscribeMessage('callUser')
  async handleCallUser(client: Socket, data: any) {
    // get socketid by user id
    const socketId = await this.videoCallService.getId(data.userToCall);
    this.server.to(socketId).emit('callUser', {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  }

  @SubscribeMessage('answerCall')
  async handleAnswerCall(client: Socket, data: any) {
    const socketId = await this.videoCallService.getId(data.to);
    this.server.to(socketId).emit('callAccepted', data.signal);
  }

  @SubscribeMessage('endCall')
  async handleEndCall(client: Socket, data: any) {
    console.log(data);
    const socketId = await this.videoCallService.getId(data.to);
    this.server.to(socketId).emit('callEnded', data.signal);
  }
}
