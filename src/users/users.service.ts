import {
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

  async findOne(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update({ file, id, updateUserDto, userId }: UpdateParams) {
    const user = await this.findOne(id);

    updateUserDto.email = updateUserDto.email
      ? updateUserDto.email
      : user.email;
    updateUserDto.username = updateUserDto.username
      ? updateUserDto.username
      : user.username;
    updateUserDto.avatar = updateUserDto.avatar
      ? updateUserDto.avatar
      : user.avatar;
    updateUserDto.password = updateUserDto.password
      ? await bcrypt.hash(updateUserDto.password, 10)
      : user.password;

    if (userId !== id) {
      throw new UnauthorizedException(
        'You are not authorized to update this user',
      );
    }

    if (file) {
      updateUserDto.avatar = `/images/avatars/${file.filename}`;
    }

    const updatedUser = await this.prismaService.user.update({
      data: updateUserDto,
      where: { id },
    });
    return updatedUser;
  }
}
