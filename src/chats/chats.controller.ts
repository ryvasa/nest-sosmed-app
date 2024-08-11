import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Req,
  UseGuards,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';
import { CreateChatDto } from './dto/create-chat';

@ApiTags('chats')
@UseGuards(JwtAuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 201, description: 'Create Chat.' })
  @ApiOperation({ summary: 'Create Chat' })
  @Post()
  create(@Req() request: any, @Body() createChatDto: CreateChatDto) {
    return this.chatsService.create(request.user.id, createChatDto.receiverId);
  }

  @ApiOperation({ summary: 'Get All Chats' })
  @ApiResponse({
    status: 200,
    description: 'List of chats retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({ name: 'take', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @ApiQuery({ name: 'username', required: false, type: String })
  @Get()
  findAll(
    @Req() request: any,
    @Query('username') username?: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.chatsService.findAll({
      userId: request.user.id,
      take: take || 30,
      skip: skip || 0,
      username,
    });
  }

  @ApiOperation({ summary: 'Get Chat by ID' })
  @ApiResponse({ status: 200, description: 'Chat retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatsService.findOne(id);
  }

  @ApiOperation({ summary: 'Delete Chat by ID' })
  @ApiResponse({ status: 200, description: 'Chat deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Chat not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Delete(':id')
  remove(@Req() request: any, @Param('id') id: string) {
    return this.chatsService.remove(id, request.user.id);
  }
}
