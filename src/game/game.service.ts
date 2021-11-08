import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
        return await this.gameRepository.save(game);
      } catch (error) {
        throw new InternalServerErrorException();
      }
    }
  }

  async updateGame(id: number, updateGameDto: UpdateGameDto): Promise<Game> {
    if (Object.keys(updateGameDto).length === 0) {
      throw new BadRequestException('요청 수정 값이 잘못되었습니다.');
    }
    await this.gameRepository.update({ id }, updateGameDto);
    return await this.getGameById(id);
  }
}
