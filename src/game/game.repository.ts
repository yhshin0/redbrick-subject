import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
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

  async addOrRemoveLike(game: Game, user: User): Promise<{ message: string }> {
    let message = '';
    const query = this.createQueryBuilder('game');
    const gameFound = await query
      .leftJoinAndSelect('game.likes', 'likes')
      .where('game.id = :gameId', { gameId: game.id })
      .andWhere('likes.id = :userId', { userId: user.id })
      .getOne();

    if (!gameFound) {
      game.likes.push(user);
      message = '좋아요가 완료 되었습니다.';
    } else {
      game.likes = game.likes.filter((like) => {
        like.id !== user.id;
      });
      message = '좋아요가 취소 되었습니다.';
    }
    try {
      await this.save(game);
      return { message: message };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
