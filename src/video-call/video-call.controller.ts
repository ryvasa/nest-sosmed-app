import { Controller, UseGuards, Get, Post, Body, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/utils/jwt/jwt.auth.guard';
import { VideoCallService } from './video-call.service';
import { VideoCallDto } from './video-call.dto';

@UseGuards(JwtAuthGuard)
@ApiTags('video-call')
@Controller('video-call')
export class VideoCallController {
  constructor(private readonly videoCallService: VideoCallService) {}

  @ApiOperation({ summary: 'Get All Users' })
  @Post()
  add(@Body() body: VideoCallDto) {
    return this.videoCallService.addSocketId(body);
  }

  @ApiOperation({ summary: 'Get All Users' })
  @Get(':id')
  getAll(@Param('id') id: string) {
    return this.videoCallService.getId(id);
  }
}
