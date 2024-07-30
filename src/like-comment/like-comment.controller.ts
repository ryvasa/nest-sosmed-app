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
import { LikeCommentService } from './like-comment.service';

@Controller('threads/:threadId/comments/:commentId/like')
@UseGuards(JwtAuthGuard)
@ApiTags('like-comments')
export class LikeCommentController {
  constructor(private readonly likeCommentService: LikeCommentService) {}

  @ApiResponse({ status: 201, description: 'Like Comment.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Like a Comment' })
  @Post()
  create(
    @Req() request: any,
    @Param('threadId') threadId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.likeCommentService.create({
      userId: request.user.id,
      commentId,
      threadId,
    });
  }

  @ApiResponse({ status: 200, description: 'Delete like thread.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Delete like a Thread' })
  @Delete()
  remove(
    @Req() request: any,
    @Param('threadId') threadId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.likeCommentService.remove({
      userId: request.user.id,
      commentId,
      threadId,
    });
  }
}
