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
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThreadsService } from './threads.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';

@ApiTags('threads')
@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201, description: 'Create Threads.' })
  @ApiOperation({ summary: 'Create New Threads' })
  @Post()
  create(@Req() request, @Body() createThreadDto: CreateThreadDto) {
    return this.threadsService.create(request.user.id, createThreadDto);
  }

  @ApiResponse({ status: 200, description: 'Get Threads.' })
  @ApiOperation({ summary: 'Get Latest Threads' })
  @Get()
  findAll() {
    return this.threadsService.findAll();
  }

  @ApiResponse({ status: 200, description: 'Get Thread.' })
  @ApiResponse({ status: 404, description: 'Threads Not Found.' })
  @ApiOperation({ summary: 'Get Thread By Id' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.threadsService.findOne(+id);
  }

  @ApiResponse({ status: 200, description: 'Update Thread.' })
  @ApiResponse({ status: 404, description: 'Threads Not Found.' })
  @ApiOperation({ summary: 'Update Thread By Id' })
  @ApiParam({ name: 'id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateThreadDto: UpdateThreadDto) {
    return this.threadsService.update(+id, updateThreadDto);
  }

  @ApiResponse({ status: 200, description: 'Delete Thread.' })
  @ApiResponse({ status: 404, description: 'Threads Not Found.' })
  @ApiOperation({ summary: 'Delete Thread By Id' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.threadsService.remove(+id);
  }
}
