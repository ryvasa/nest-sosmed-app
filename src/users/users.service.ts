import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';

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

  async findOne(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User) {
    await this.findOne(id);

    if (currentUser.id !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const user = await this.prismaService.user.update({
      data: updateUserDto,
      where: { id },
    });
    return user;
  }
}
