import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';

interface UpdateParams {
  file?: Express.Multer.File; // file adalah opsional
  id: string;
  updateUserDto: UpdateUserDto;
  userId: string;
}

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findAll({ username, take, skip }): Promise<Array<User>> {
    const users = await this.prismaService.user.findMany({
      where: {
        username: { contains: username },
      },
      take: take ? take : 30,
      skip: skip ? skip : 0,
    });
    return users;
  }

  async findOne(id: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      select: {
        id: true,
        username: true,
        active: true,
        created_at: true,
        updated_at: true,
        avatar: true,
        email: true,
      },
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update({ file, id, updateUserDto, userId }: UpdateParams) {
    const user = await this.prismaService.user.findFirst({ where: { id } });
    const validUser = bcrypt.compare(updateUserDto.password, user.password);
    if (!validUser) {
      throw new ForbiddenException('You are not allowed');
    }
    updateUserDto.email = updateUserDto.email
      ? updateUserDto.email
      : user.email;
    updateUserDto.username = updateUserDto.username
      ? updateUserDto.username
      : user.username;
    updateUserDto.avatar = updateUserDto.currentAvatar
      ? updateUserDto.currentAvatar
      : user.avatar;
    updateUserDto.password = updateUserDto.password
      ? await bcrypt.hash(updateUserDto.newPassword, 10)
      : user.password;

    if (userId !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }

    if (file) {
      updateUserDto.avatar = `images/avatars/${file.filename}`;
    }
    const { newPassword, currentAvatar, ...data } = updateUserDto;
    const updatedUser = await this.prismaService.user.update({
      data,
      where: { id },
    });
    return updatedUser;
  }

  async setActiveToUser(userId: string) {
    await this.findOne(userId);
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        active: true,
      },
    });
    return updatedUser;
  }
  async setNonActiveToUser(userId: string) {
    await this.findOne(userId);
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        active: false,
      },
    });
    return updatedUser;
  }
}
