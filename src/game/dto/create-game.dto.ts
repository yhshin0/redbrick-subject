import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGameDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  code: string;

  @IsNumber()
  projectId: number;
}
