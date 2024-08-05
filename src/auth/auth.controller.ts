import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Get,
  Req,
  UseInterceptors,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { Response } from 'express';
import { LocalAuthGuard } from './utils/local/local-auth.guard';
import { JwtAuthGuard } from './utils/jwt/jwt.auth.guard';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UserInterceptor } from '../interceptors/user.interceptor';

@UseInterceptors(new UserInterceptor())
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'Return User.' })
  @ApiResponse({
    status: 400,
    description: 'Confirm password and password not match.',
  })
  @ApiResponse({
    status: 400,
    description: 'Username or email is already in use.',
  })
  register(@Body() registerterUserDto: RegisterAuthDto, @Res() res: Response) {
    return this.authService.register(registerterUserDto, res);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login user.' })
  @ApiResponse({
    status: 404,
    description: 'Email not found.',
  })
  @ApiResponse({ status: 401, description: 'Wrong password.' })
  @ApiResponse({ status: 200, description: 'Login User.' })
  login(
    @Body() loginAuthDto: LoginAuthDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    return this.authService.login(req.user, res);
  }

  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 200, description: 'Current User.' })
  @ApiOperation({ summary: 'Get Current User' })
  @Get('me')
  async me(@Req() request: any) {
    return this.authService.me(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 200, description: 'Logout success.' })
  @ApiOperation({ summary: 'User Logout' })
  @Delete('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    return this.authService.logout(response);
  }
}
