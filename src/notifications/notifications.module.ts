import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';
import { NotificationController } from './notification.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [NotificationsGateway, NotificationsService],
  controllers: [NotificationController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
