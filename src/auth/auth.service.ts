import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Response } from 'express';
import { User } from '@prisma/client';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(data: LoginAuthDto): Promise<any> {
    const user = await this.prismaService.user.findFirst({
      where: { email: data.email },
    });

    if (!user) {
      throw new NotFoundException('Email not found');
    }
    if (!user.password) {
      throw new BadRequestException('Wrong password');
    }
    const isMatch = await bcrypt.compare(data.password, user.password);

    if (user && isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerUserDto: RegisterAuthDto): Promise<User> {
    if (registerUserDto.confirmPassword !== registerUserDto.password) {
      throw new BadRequestException('Confirm password and password not match.');
    }

    const isUserExist = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            username: registerUserDto.username,
          },
          {
            email: registerUserDto.email,
          },
        ],
      },
    });
    if (isUserExist) {
      throw new BadRequestException('Username or email is already in use.');
    }

    registerUserDto.password = await bcrypt.hash(registerUserDto.password, 10);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...data } = registerUserDto;
    const user = await this.prismaService.user.create({
      data,
    });
    return user;
  }

  async login(user: User, res: Response) {
    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      username: user.username,
    });
    res.cookie('token', accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).send({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
      },
    });
    return user;
  }

  async me(id: string): Promise<User> {
    const auth = await this.prismaService.user.findFirst({ where: { id } });
    return auth;
  }

  async logout(res: Response) {
    res.clearCookie('token');
    return 'User has been logout';
  }
}
