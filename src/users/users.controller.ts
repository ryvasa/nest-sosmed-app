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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/utils/jwt/jwt.auth.guard';
import { UserInterceptor } from '../interceptors/user.interceptor';

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
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto, request.user);
  }
}
