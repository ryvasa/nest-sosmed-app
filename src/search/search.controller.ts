import {
  Controller,
  UseGuards,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/utils/jwt/jwt.auth.guard';
import { Searchservice } from './search.service';

@UseGuards(JwtAuthGuard)
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: Searchservice) {}

  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 200, description: 'Send Dta.' })
  @ApiResponse({ status: 404, description: 'Data Not Found.' })
  @ApiQuery({ name: 'query', required: false, type: String })
  @ApiQuery({ name: 'take', required: false, type: String })
  @ApiQuery({ name: 'skip', required: false, type: String })
  @ApiOperation({ summary: 'Get All Users' })
  @Get()
  findAll(
    @Query('query') query?: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.searchService.findAll({
      query,
      take: take || 30,
      skip: skip || 0,
    });
  }
}
