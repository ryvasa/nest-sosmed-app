import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ type: String })
  @IsOptional()
  email?: string;

  @IsOptional()
  @ApiProperty({ type: String })
  username?: string;

  @IsOptional()
  @ApiProperty({ type: String })
  password?: string;

  @IsOptional()
  @ApiProperty({ type: String })
  newPassword?: string;

  @IsOptional()
  @ApiProperty({ type: String })
  avatar?: string;

  @IsOptional()
  @ApiProperty({ type: String })
  currentAvatar?: string;
}
