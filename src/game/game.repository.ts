import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { EntityRepository, Repository } from 'typeorm';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {
  async createGame(
    createGameDto: CreateGameDto,
    project: Project,
    user: User,
  ): Promise<Game> {
    const param = { ...createGameDto, project, user };
    const game = this.create(param);
    try {
      await this.save(game);
      return game;
    } catch (error) {
      if ((error.code = 'SQLITE_CONSTRAINT')) {
        throw new BadRequestException('이미 퍼블리싱 된 게임입니다.');
      }
      throw new InternalServerErrorException();
    }
  }
}
