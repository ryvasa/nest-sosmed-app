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
import { DislikeCommentService } from './dislike-comment.service';

@Controller('threads/:threadId/comments/:commentId/dislike')
@UseGuards(JwtAuthGuard)
@ApiTags('dislike-comments')
export class DislikeCommentController {
  constructor(private readonly dislikeCommentService: DislikeCommentService) {}

  @ApiResponse({ status: 201, description: 'Dislike thread.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Dislike a Thread' })
  @Post()
  create(
    @Req() request,
    @Param('threadId') threadId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.dislikeCommentService.create({
      userId: request.user.id,
      commentId,
      threadId,
    });
  }

  @ApiResponse({ status: 200, description: 'Delete dislike thread.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Delete Dislike a Thread' })
  @Delete()
  remove(
    @Req() request,
    @Param('threadId') threadId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.dislikeCommentService.remove({
      userId: request.user.id,
      commentId,
      threadId,
    });
  }
}
