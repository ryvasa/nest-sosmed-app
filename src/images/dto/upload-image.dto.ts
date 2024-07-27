import { IsNotEmpty } from 'class-validator';

export class UploadImageDto {
  @IsNotEmpty()
  thread_id: string;

  @IsNotEmpty()
  image: string;
}
