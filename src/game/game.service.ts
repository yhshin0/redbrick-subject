import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { GAME_CONSTANTS, GAME_ERROR_MSG } from './game.constants';
import { GameRepository } from './game.repository';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private gameRepository: GameRepository,
  ) {}

  createGame({
    createGameDto,
    project,
    user,
  }: {
    createGameDto: CreateGameDto;
    project: Project;
    user: User;
  }): Promise<Game> {
    return this.gameRepository.createGame({ createGameDto, project, user });
  }

  getGames(page: number, pageSize: number): Promise<Game[]> {
    page =
      isNaN(page) || page <= 0 ? GAME_CONSTANTS.LIST_DEFAULT_PAGE : page - 1;
    pageSize =
      isNaN(pageSize) || pageSize <= 0
        ? GAME_CONSTANTS.LIST_DEFAULT_PAGE_SIZE
        : pageSize;
    return this.gameRepository.findGames(page, pageSize);
  }

  async getGameById(id: number): Promise<Game> {
    const game = await this.gameRepository.findOneGame(id);
    if (!game) {
      throw new NotFoundException(GAME_ERROR_MSG.INVALID_GAME_ID);
    }

    return game;
  }

  async increaseCount(id: number): Promise<Game> {
    const game = await this.gameRepository.findOneGame(id);
    if (!game) {
      throw new NotFoundException(GAME_ERROR_MSG.INVALID_GAME_ID);
    }

    game.viewCount++;
    try {
      return await this.gameRepository.save(game);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getGameByProject(project: Project): Promise<Game> {
    const game = await this.gameRepository.findOne({
      where: { project },
      withDeleted: true,
    });

    if (!game) {
      throw new NotFoundException(GAME_ERROR_MSG.INVALID_GAME_ID);
    }

    return game;
  }

  async restoreGame(id: number): Promise<void> {
    await this.gameRepository.restore(id);
  }

  async updateGame({
    id,
    updateGameDto,
    user,
  }: {
    id: number;
    updateGameDto: UpdateGameDto;
    user: User;
  }): Promise<Game> {
    if (Object.keys(updateGameDto).length === 0) {
      throw new BadRequestException(GAME_ERROR_MSG.NO_VALUE_FOR_UPDATE);
    }
    const game = await this.getGameById(id);
    if (game.user.id !== user.id) {
      throw new UnauthorizedException(GAME_ERROR_MSG.NOT_AUTHOR);
    }
    await this.gameRepository.update({ id }, updateGameDto);
    return await this.getGameById(id);
  }

  async deleteGame(id: number, user: User): Promise<{ message: string }> {
    const game = await this.getGameById(id);
    if (game.user.id !== user.id) {
      throw new UnauthorizedException(GAME_ERROR_MSG.NOT_AUTHOR);
    }
    await this.gameRepository.softDelete({ id });
    return { message: '게임 삭제 완료' };
  }

  async addOrRemoveLike(id: number, user: User): Promise<{ message: string }> {
    const game = await this.gameRepository.findOne({ id });
    if (!game) {
      throw new NotFoundException(GAME_ERROR_MSG.INVALID_GAME_ID);
    }
    return this.gameRepository.addOrRemoveLike(game, user);
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
    page =
      isNaN(page) || page <= 0 ? GAME_CONSTANTS.LIST_DEFAULT_PAGE : page - 1;
    pageSize =
      isNaN(pageSize) || pageSize <= 0
        ? GAME_CONSTANTS.LIST_DEFAULT_PAGE_SIZE
        : pageSize;
    const totalCount = await this.gameRepository
      .createQueryBuilder('game')
      .innerJoin('game.user', 'user')
      .where(`game.title like :keyword`, { keyword: `%${keyword}%` })
      .orWhere(`user.nickname like :keyword`, { keyword: `%${keyword}%` })
      .getCount();
    const data = await this.gameRepository
      .createQueryBuilder('game')
      .innerJoin('game.user', 'user')
      .where(`game.title like :keyword`, { keyword: `%${keyword}%` })
      .orWhere(`user.nickname like :keyword`, { keyword: `%${keyword}%` })
      .limit(pageSize)
      .offset(page * pageSize)
      .getMany();
    return { totalCount, data };
  }
}
