import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UploadImageService } from './upload-image.service';
import { ChatUserService } from './chat-user.service';

@Global()
@Module({
  providers: [PrismaService, UploadImageService, ChatUserService],
  exports: [PrismaService, UploadImageService, ChatUserService],
})
export class CommonModule {}
