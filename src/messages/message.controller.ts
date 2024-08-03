import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';
import { UpdateMessageDto } from './dto/update-message.sto';

@UseGuards(JwtAuthGuard)
@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessagesService) {}

  @ApiOperation({ summary: 'Get Unreaded Message by ID' })
  @ApiResponse({
    status: 200,
    description: 'Message cound sended successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get('/unreaded')
  async countUnreaded(@Req() request: any) {
    return this.messageService.findUnreadedMessage(request.user.id);
  }
  @ApiOperation({ summary: 'Get Message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({ name: 'take', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @Get('chats/:id')
  async findManyByChatId(
    @Param('id') id: string,
    @Req() request: any,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.messageService.findManyByChatId(
      request.user.id,
      id,
      take,
      skip,
    );
  }
  @ApiOperation({ summary: 'Get Message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() request: any,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.messageService.update(id, request.user.id, updateMessageDto);
  }

  @ApiOperation({ summary: 'Delete Message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Message not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: any) {
    return this.messageService.remove(id, request.user.id);
  }
}
