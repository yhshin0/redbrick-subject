import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {
  async createGame(createGameDto: CreateGameDto): Promise<Game> {
    const game = this.create(createGameDto);
    try {
      await this.save(game);
      return game;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
