import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';
import { UpdateMessageDto } from './dto/update-message.sto';

@UseGuards(JwtAuthGuard)
@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessagesService) {}

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
