import { IsNumber, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  // @IsNumber()
  // userId: number;
}
