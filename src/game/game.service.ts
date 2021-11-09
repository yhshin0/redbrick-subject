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
import { GameRepository } from './game.repository';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(GameRepository)
    private gameRepository: GameRepository,
  ) {}

  createGame(
    createGameDto: CreateGameDto,
    project: Project,
    user: User,
  ): Promise<Game> {
    return this.gameRepository.createGame(createGameDto, project, user);
  }

  getGames(limit: number, offset: number): Promise<Game[]> {
    return this.gameRepository.findGames(limit, offset);
  }

  async getGameById(id: number, addViewCount = false): Promise<Game> {
    const game = await this.gameRepository.findOneGame(id);
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

  async updateGame(
    id: number,
    updateGameDto: UpdateGameDto,
    user: User,
  ): Promise<Game> {
    if (Object.keys(updateGameDto).length === 0) {
      throw new BadRequestException('요청 수정 값이 잘못되었습니다.');
    }
    const game = await this.getGameById(id);
    if (game.user.id !== user.id) {
      throw new UnauthorizedException('해당 프로젝트를 작성한 유저가 아닙니다');
    }
    await this.gameRepository.update({ id }, updateGameDto);
    return await this.getGameById(id);
  }

  async deleteGame(id: number, user: User): Promise<{ message: string }> {
    const game = await this.getGameById(id);
    if (game.user.id !== user.id) {
      throw new UnauthorizedException('해당 프로젝트를 작성한 유저가 아닙니다');
    }
    await this.gameRepository.softDelete({ id });
    return { message: '게임 삭제 완료' };
  }

  async addOrRemoveLike(id: number, user: User): Promise<{ message: string }> {
    const game = await this.gameRepository.findOne({ id });
    if (!game) {
      throw new NotFoundException('유효한 게임 id가 아닙니다.');
    }
    return this.gameRepository.addOrRemoveLike(game, user);
  }
}
