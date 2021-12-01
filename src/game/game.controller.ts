import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get()
  getGames(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ totalCount: number; data: Game[] }> {
    return this.gameService.getGames(+page, +pageSize);
  }

  @Get('/search')
  search(
    @Query('keyword') keyword: string,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ totalCount: number; data: Game[] }> {
    return this.gameService.search({
      page: +page,
      pageSize: +pageSize,
      keyword,
    });
  }

  @Get('/:id')
  getGameById(@Param('id') id: string): Promise<Game> {
    return this.gameService.getGameById(+id);
  }

  @Get('/count/:id')
  increaseCount(@Param('id') id: string): Promise<Game> {
    return this.gameService.increaseCount(+id);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  updateGame(
    @Param('id') id: string,
    @Body() updateGameDto: UpdateGameDto,
    @GetUser() user: User,
  ): Promise<Game> {
    return this.gameService.updateGame({ id: +id, updateGameDto, user });
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  deleteGameById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.gameService.deleteGame(+id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/likes/:id')
  addOrRemoveLike(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.gameService.addOrRemoveLike(+id, user);
  }
}
