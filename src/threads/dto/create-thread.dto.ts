import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateThreadDto {
  @ApiProperty()
  @IsNotEmpty()
  body: string;
}
