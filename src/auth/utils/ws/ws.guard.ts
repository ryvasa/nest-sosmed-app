import { Injectable, CanActivate } from '@nestjs/common';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt'; // Menggunakan JwtService dari NestJS
import { UsersService } from '../../../users/users.service';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: any): Promise<boolean> {
    const socket: Socket = context.switchToWs().getClient();
    const cookies = socket.handshake.headers.cookie || '';
    const cookiesObj = this.parseCookies(cookies);
    const token = cookiesObj['token'];

    if (token) {
      try {
        const decoded = this.jwtService.verify(token);
        const user = await this.userService.findOne(decoded.id);

        if (user) {
          socket['user'] = user;
          return true;
        }
      } catch (error) {
        console.log('Invalid token:', error);
        return false;
      }
    }
    return false;
  }

  private parseCookies(cookieHeader: string): Record<string, string> {
    return cookieHeader
      .split(';')
      .map((cookie) => cookie.split('='))
      .reduce((acc: Record<string, string>, [key, value]) => {
        acc[key.trim()] = value;
        return acc;
      }, {});
  }
}
