import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ResponseAuthDto } from './dto/response-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Response } from 'express';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prismaService.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Email not found');
    }
    if (!user.password) {
      throw new BadRequestException('Wrong password');
    }
    const isMatch = await bcrypt.compare(pass, user.password);

    if (user && isMatch) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerUserDto: RegisterAuthDto): Promise<ResponseAuthDto> {
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
    return { username: user.username, email: user.email };
  }

  async login(
    loginAuthDto: LoginAuthDto,
    res: Response,
  ): Promise<ResponseAuthDto> {
    const user: User = await this.prismaService.user.findFirst({
      where: {
        email: loginAuthDto.email,
      },
    });
    if (!user) {
      throw new NotFoundException('Email not found.');
    }
    const isPasswordValid = await bcrypt.compare(
      loginAuthDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Wrong password.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
    });
    res.cookie('token', accessToken, { httpOnly: true });

    res
      .send({
        username: user.username,
        email: user.email,
        avatar: user.avatar || '',
      })
      .status(200);
    return user;
  }

  async me(id: string): Promise<ResponseAuthDto> {
    const auth = await this.prismaService.user.findFirst({ where: { id } });
    return auth;
  }
}
