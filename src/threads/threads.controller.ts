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
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThreadsService } from './threads.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { photosStorage } from '../common/storage.config';
import { ThreadInterceptor } from '../interceptors/thread.interceptor';

@UseInterceptors(new ThreadInterceptor())
@UseGuards(JwtAuthGuard)
@ApiTags('threads')
@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @ApiResponse({ status: 201, description: 'Create Threads.' })
  @ApiOperation({ summary: 'Create New Threads' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        body: {
          type: 'string',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @Post()
  @UseInterceptors(FilesInterceptor('images', 4, photosStorage))
  create(
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2000000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @Req() request: any,
    @Body() createThreadDto: CreateThreadDto,
  ) {
    return this.threadsService.create(files, request.user.id, createThreadDto);
  }

  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 200, description: 'Send Threads.' })
  @ApiResponse({ status: 404, description: 'Thread Not Found.' })
  @ApiQuery({ name: 'body', required: false, type: String })
  @ApiQuery({ name: 'take', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @ApiOperation({ summary: 'Get All Users' })
  @Get()
  findAll(
    @Query('body') body?: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.threadsService.findAll({
      body,
      take: take || 30,
      skip: skip || 0,
    });
  }

  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 200, description: 'Send Threads.' })
  @ApiResponse({ status: 404, description: 'User Not Found.' })
  @ApiQuery({ name: 'take', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @ApiOperation({ summary: 'Get Many Users Threads' })
  @Get('user/:id')
  findManyByCreator(
    @Param('id') id: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.threadsService.findManyByCreator({
      userId: id,
      take: take || 30,
      skip: skip || 0,
    });
  }

  @ApiResponse({ status: 200, description: 'Get Thread.' })
  @ApiResponse({ status: 404, description: 'Threads Not Found.' })
  @ApiOperation({ summary: 'Get Thread By Id' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.threadsService.findOne(id);
  }

  @ApiResponse({ status: 200, description: 'Update Thread.' })
  @ApiResponse({ status: 404, description: 'Threads Not Found.' })
  @ApiOperation({ summary: 'Update Thread By Id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        body: {
          type: 'string',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('images', 4, photosStorage))
  @ApiParam({ name: 'id' })
  @Patch(':id')
  update(
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2000000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @Param('id') id: string,
    @Body() updateThreadDto: UpdateThreadDto,
    @Req() request: any,
  ) {
    return this.threadsService.update({
      files,
      id,
      updateThreadDto,
      userId: request.user.id,
    });
  }

  @ApiResponse({ status: 200, description: 'Delete Thread.' })
  @ApiResponse({ status: 404, description: 'Threads Not Found.' })
  @ApiOperation({ summary: 'Delete Thread By Id' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: any) {
    return this.threadsService.remove(id, request.user.id);
  }
}
