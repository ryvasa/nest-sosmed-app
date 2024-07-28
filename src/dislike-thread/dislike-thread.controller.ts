import {
  Controller,
  Post,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DislikeThreadService } from './dislike-thread.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';

@Controller('threads/:id/dislike')
@UseGuards(JwtAuthGuard)
@ApiTags('dislike-threads')
export class DislikeThreadController {
  constructor(private readonly dislikeThreadService: DislikeThreadService) {}

  @ApiResponse({ status: 201, description: 'Dislike thread.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Dislike a Thread' })
  @Post()
  create(@Req() request, @Param('id') id: string) {
    return this.dislikeThreadService.create(request.user.id, id);
  }

  @ApiResponse({ status: 200, description: 'Delete dislike thread.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Dislike a Thread' })
  @Delete()
  remove(@Req() request, @Param('id') id: string) {
    return this.dislikeThreadService.remove(request.user.id, id);
  }
}
