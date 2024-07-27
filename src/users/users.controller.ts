import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  Req,
  Query,
  ParseIntPipe,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';
import { UserInterceptor } from '../interceptors/user.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { avatarsStorage } from '../common/storage.config';

@UseInterceptors(new UserInterceptor())
@UseGuards(JwtAuthGuard)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 200, description: 'Send Users.' })
  @ApiResponse({ status: 404, description: 'User Not Found.' })
  @ApiQuery({ name: 'username', required: false, type: String })
  @ApiQuery({ name: 'take', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @ApiOperation({ summary: 'Get All Users' })
  @Get()
  async findAll(
    @Query('username') username?: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ): Promise<Array<User>> {
    return this.usersService.findAll({
      username,
      take: take || 30,
      skip: skip || 0,
    });
  }

  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 200, description: 'Update User.' })
  @ApiOperation({ summary: 'Update User with credential' })
  @ApiParam({ name: 'id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          nullable: true,
        },
        username: {
          type: 'string',
          nullable: true,
        },
        password: {
          type: 'string',
          nullable: true,
        },
        avatar: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
      },
    },
  })
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar', avatarsStorage))
  update(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 2000000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('id')
    id: string,
    @Req() request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update({
      file,
      id,
      updateUserDto,
      userId: request.user.id,
    });
  }
}
