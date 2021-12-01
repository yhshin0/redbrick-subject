import { IsString } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  title: string;

  @IsString()
  code: string;
}
