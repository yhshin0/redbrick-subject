import { IsString } from 'class-validator';

export class PublishProjectDto {
  @IsString()
  description: string;
}
