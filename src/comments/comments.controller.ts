import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentInterceptor } from '../interceptors/comment.interceptor';

@UseInterceptors(new CommentInterceptor())
@ApiTags('comments')
@UseGuards(JwtAuthGuard)
@Controller('threads/:threadId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiResponse({ status: 200, description: 'Created Comment.' })
  @ApiResponse({ status: 404, description: 'Threads Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Created Comment for a thread' })
  @Post()
  create(
    @Param('threadId') threadId: string,
    @Req() request: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(
      threadId,
      createCommentDto,
      request.user.id,
    );
  }

  @ApiResponse({ status: 200, description: 'Send All Comments.' })
  @ApiResponse({ status: 404, description: 'Threads Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Send All Comments from a Thread.' })
  @Get()
  findAll(@Param('threadId') threadId: string) {
    return this.commentsService.findAllCommentsThread(threadId);
  }

  @ApiResponse({ status: 200, description: 'Send a Comment.' })
  @ApiResponse({ status: 404, description: 'Commend Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Send a Comment from a Thread.' })
  @Get(':commentId')
  findOne(
    @Param('threadId') threadId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.commentsService.findOne(commentId, threadId);
  }

  @ApiResponse({ status: 200, description: 'Update a Comment.' })
  @ApiResponse({ status: 404, description: 'Threads Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Commend Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Update a Comment from a Thread.' })
  @Patch(':commentId')
  update(
    @Param('threadId') threadId: string,
    @Param('commentId') commentId: string,
    @Req() request: any,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentsService.update({
      threadId,
      commentId,
      updateCommentDto,
      userId: request.user.id,
    });
  }

  @ApiResponse({ status: 200, description: 'Update a Comment.' })
  @ApiResponse({ status: 404, description: 'Commend Not Found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiOperation({ summary: 'Update a Comment from a Thread.' })
  @Delete(':commentId')
  remove(
    @Param('commentId') commentId: string,
    @Param('threadId') threadId: string,
    @Req() request: any,
  ) {
    return this.commentsService.remove(commentId, request.user.id, threadId);
  }
}
