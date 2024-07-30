import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  message: string;
}
