import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersGateway } from './users.gateway';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway],
  exports: [UsersService],
})
export class UsersModule {}
