import { ApiProperty } from '@nestjs/swagger';

export class VideoCallDto {
  @ApiProperty({ type: String })
  key: string;

  @ApiProperty({ type: String })
  value: string;
}
