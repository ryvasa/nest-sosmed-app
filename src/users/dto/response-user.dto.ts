import { ApiProperty } from '@nestjs/swagger';

export class ResponseUserDto {
  @ApiProperty({ type: String })
  avatar?: string;

  @ApiProperty({ type: String })
  token?: string;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: String })
  username: string;
}
