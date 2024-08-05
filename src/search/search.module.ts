import { Module } from '@nestjs/common';
import { Searchservice } from './search.service';
import { SearchController } from './search.controller';
import { UsersModule } from 'src/users/users.module';
import { ThreadsModule } from 'src/threads/threads.module';

@Module({
  providers: [Searchservice],
  controllers: [SearchController],
  imports: [UsersModule, ThreadsModule],
})
export class SearchModule {}
