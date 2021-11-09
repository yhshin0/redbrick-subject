import { InternalServerErrorException } from '@nestjs/common';
import { Project } from 'src/projects/entities/project.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {
  async createGame(
    createGameDto: CreateGameDto,
    project: Project,
  ): Promise<Game> {
    const param = { ...createGameDto, project };
    const game = this.create(param);
    try {
      await this.save(game);
      return game;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
