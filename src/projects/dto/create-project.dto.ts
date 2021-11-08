import { IsNumber, IsString } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  code: string;

  // @IsNumber()
  // userId: number;
}
