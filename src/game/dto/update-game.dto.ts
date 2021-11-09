import { IsOptional, IsString } from 'class-validator';

export class UpdateGameDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  code: string;
}
