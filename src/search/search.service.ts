import { Injectable } from '@nestjs/common';
import { ThreadsService } from 'src/threads/threads.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class Searchservice {
  constructor(
    private readonly usersService: UsersService,
    private readonly threadService: ThreadsService,
  ) {}

  async findAll({ query, take, skip }): Promise<any> {
    const users = await this.usersService.findAll({
      take,
      skip,
      username: query,
    });
    const threads = await this.threadService.findAll({
      take,
      skip,
      body: query,
    });
    return { users, threads };
  }
}
