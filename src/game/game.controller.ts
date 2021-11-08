import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post()
  createGame(@Body() createGameDto: CreateGameDto): Promise<Game> {
    return this.gameService.createGame(createGameDto);
  }

  @Get()
  getGames(@Query('page') page: string): Promise<Game[]> {
    const limit = 5;
    const offset = page ? (Number(page) - 1) * limit : 0;
    return this.gameService.getGames(limit, offset);
  }

  @Get('/:id')
  getGameById(@Param('id') id: string): Promise<Game> {
    return this.gameService.getGameById(Number(id), true);
  }

  @Patch('/:id')
  updateGame(
    @Param('id') id: string,
    @Body() updateGameDto: UpdateGameDto,
  ): Promise<Game> {
    return this.gameService.updateGame(Number(id), updateGameDto);
  }

  @Delete('/:id')
  deleteGameById(@Param('id') id: string): Promise<{ message: string }> {
    return this.gameService.deleteGame(Number(id));
  }
}
