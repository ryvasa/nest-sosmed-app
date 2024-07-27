import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { Image } from '@prisma/client';

@Injectable()
export class ImagesService {
  constructor(private prismaService: PrismaService) {}

  async upload(uploadImageDto: UploadImageDto): Promise<Image> {
    const image = await this.prismaService.image.create({
      data: uploadImageDto,
    });
    return image;
  }
}
