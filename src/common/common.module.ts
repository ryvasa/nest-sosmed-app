import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UploadImageService } from './upload-image.service';

@Global()
@Module({
  providers: [PrismaService, UploadImageService],
  exports: [PrismaService, UploadImageService],
})
export class CommonModule {}
