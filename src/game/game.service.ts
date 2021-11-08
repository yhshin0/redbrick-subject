import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';
import { GameRepository } from './game.repository';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private gameRepository: GameRepository,
  ) {}

  createGame(createGameDto: CreateGameDto): Promise<Game> {
    return this.gameRepository.createGame(createGameDto);
  }

  async getGameById(id: number, addViewCount = false): Promise<Game> {
    const game = await this.gameRepository.findOne({ id });
    if (!game) {
      throw new NotFoundException('유효한 게임 id가 아닙니다.');
    }

    if (addViewCount) {
      game.viewCount = game.viewCount + 1;
      try {
        await this.gameRepository.save(game);
      } catch (error) {
        throw new InternalServerErrorException();
      }
    }
    return game;
  }
}
