import { PartialType } from '@nestjs/mapped-types';

import { IsDate, IsOptional } from 'class-validator';
import { CreateGameDto } from './create-game.dto';

export class UpdateGameDto extends PartialType(CreateGameDto) {
  @IsDate()
  @IsOptional()
  createdAt: Date;
}
