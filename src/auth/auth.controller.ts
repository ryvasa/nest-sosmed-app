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
import { AuthResponseInterceptor } from '../interceptors/auth-response-format.interceptor';

@UseInterceptors(new AuthResponseInterceptor())
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
  register(@Body() registerterUserDto: RegisterAuthDto) {
    return this.authService.register(registerterUserDto);
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
  login(@Req() req, @Res() res: Response) {
    return this.authService.login(req.user, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() request) {
    return this.authService.me(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    return this.authService.logout(response);
  }
}
