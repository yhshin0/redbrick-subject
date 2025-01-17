import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';

import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';
import { GAME_ERROR_MSG } from './game.constants';

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {
  async createGame({
    createGameDto,
    project,
    user,
  }: {
    createGameDto: CreateGameDto;
    project: Project;
    user: User;
  }): Promise<Game> {
    const game = this.create({ ...createGameDto, project, user });
    try {
      return await this.save(game);
    } catch (error) {
      throw new InternalServerErrorException(GAME_ERROR_MSG.FAIL_TO_CREATE);
    }
  }

  async toggleLike(game: Game, user: User): Promise<{ message: string }> {
    // 좋아요 추가 또는 제거
    let message = '';
    const gameLikedByUser = await this.createQueryBuilder('game')
      .leftJoinAndSelect('game.likes', 'likes')
      .where('game.id = :gameId', { gameId: game.id })
      .andWhere('likes.id = :userId', { userId: user.id })
      .getOne();

    if (!gameLikedByUser) {
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

  async findOneGame(id: number) {
    return await this.createQueryBuilder('game')
      .leftJoin('game.likes', 'likes')
      .leftJoin('game.user', 'user')
      .addSelect('user.nickname')
      .addSelect('user.id')
      .addSelect('likes.email')
      .loadRelationCountAndMap('game.likeCount', 'game.likes')
      .where('game.id = :id', { id: id })
      .getOne();
  }

  async findGames(
    page: number,
    pageSize: number,
  ): Promise<{ totalCount: number; data: Game[] }> {
    const data = await this.createQueryBuilder('game')
      .leftJoin('game.likes', 'likes')
      .leftJoin('game.user', 'user')
      .addSelect('user.nickname')
      .addSelect('user.id')
      .addSelect('likes.email')
      .limit(pageSize)
      .offset(page * pageSize)
      .loadRelationCountAndMap('game.likeCount', 'game.likes')
      .getManyAndCount();
    return { totalCount: data[1], data: data[0] };
  }

  async search({
    page,
    pageSize,
    keyword,
  }: {
    page: number;
    pageSize: number;
    keyword: string;
  }): Promise<{ totalCount: number; data: Game[] }> {
    const data = await this.createQueryBuilder('game')
      .innerJoin('game.user', 'user')
      .addSelect('user.id')
      .addSelect('user.nickname')
      .where(`game.title like :keyword`, { keyword: `%${keyword}%` })
      .orWhere(`user.nickname like :keyword`, { keyword: `%${keyword}%` })
      .limit(pageSize)
      .offset(page * pageSize)
      .getManyAndCount();
    return { totalCount: data[1], data: data[0] };
  }
}
