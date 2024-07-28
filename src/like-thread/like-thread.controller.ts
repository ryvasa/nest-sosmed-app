import {
  Controller,
  Post,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';
import { LikeThreadService } from './like-thread.service';

@Controller('threads/:id/like')
@UseGuards(JwtAuthGuard)
@ApiTags('like-threads')
export class LikeThreadController {
  constructor(private readonly likeThreadService: LikeThreadService) {}

  @ApiResponse({ status: 201, description: 'Like thread.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Like a Thread' })
  @Post()
  create(@Req() request, @Param('id') id: string) {
    return this.likeThreadService.create(request.user.id, id);
  }

  @ApiResponse({ status: 200, description: 'Delete like thread.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Like a Thread' })
  @Delete()
  remove(@Req() request, @Param('id') id: string) {
    return this.likeThreadService.remove(request.user.id, id);
  }
}
