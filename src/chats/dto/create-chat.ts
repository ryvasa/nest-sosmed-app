import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  receiverId: string;
}
