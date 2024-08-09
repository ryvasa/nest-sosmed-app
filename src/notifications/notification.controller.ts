import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';
import { NotificationsService } from './notifications.service';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Req() request: any) {
    return this.notificationsService.findAll(request.user.id);
  }

  @Get('count')
  async count(@Req() request: any) {
    return this.notificationsService.countNotification(request.user.id);
  }

  @Patch(':id')
  async updateOne(@Param('id') id: string, @Req() request: any) {
    return this.notificationsService.setReadedOne(id, request.user.id);
  }

  @Patch()
  async updateMany(@Req() request: any) {
    return this.notificationsService.setReadedAll(request.user.id);
  }
}
