import { PrismaService } from '../src/common/prisma.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { RegisterAuthDto } from '../src/auth/dto/register-auth.dto';
import { UploadImageService } from '../src/common/upload-image.service';

@Injectable()
export class TestService {
  constructor(
    private prismaService: PrismaService,
    private uploadImageService: UploadImageService,
  ) {}

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        email: 'test@gmail.com',
      },
    });
  }

  async getUser(): Promise<User> {
    return this.prismaService.user.findUnique({
      where: {
        email: 'test@gmail.com',
      },
    });
  }

  async createUser() {
    const user = new RegisterAuthDto();
    user.username = 'test';
    user.email = 'test@gmail.com';
    user.password = await bcrypt.hash('test', 10);
    await this.prismaService.user.create({
      data: user,
    });
  }

  async deleteImage(fileName) {
    await this.uploadImageService.deleteFile(fileName);
  }
}
