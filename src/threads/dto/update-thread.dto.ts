import { PartialType } from '@nestjs/swagger';
import { CreateThreadDto } from './create-thread.dto';
import { IsOptional } from 'class-validator';

export class UpdateThreadDto extends PartialType(CreateThreadDto) {
  @IsOptional()
  currentImages?: Array<string>;
}
