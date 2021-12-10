import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { Game } from './entities/game.entity';
import { GAME_ERROR_MSG } from './game.constants';
import { GameRepository } from './game.repository';

describe('GameRepository', () => {
  let gameRepository: GameRepository;

  const id = 1;
  const email = 'testuser@asdf.com';
  const nickname = 'nickname';
  const user = new User();

  const title = 'title';
  const code = 'code';
  const description = 'description';
  const game = new Game();

  const project = new Project();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameRepository],
    }).compile();

    gameRepository = module.get<GameRepository>(GameRepository);

    user.id = id;
    user.email = email;
    user.nickname = nickname;

    game.id = id;
    game.title = title;
    game.code = code;
    game.description = description;
    game.likes = [];

    project.id = id;
    project.title = title;
    project.code = code;
  });

  it('should be defined', () => {
    expect(gameRepository).toBeDefined();
  });

  describe('createGame', () => {
    const createGameDto = new CreateGameDto();
    createGameDto.title = title;
    createGameDto.code = code;
    createGameDto.description = description;

    it('game을 생성하는 데 성공한다', async () => {
      jest.spyOn(gameRepository, 'create').mockReturnValue(game);
      jest.spyOn(gameRepository, 'save').mockResolvedValue(game);

      const result = await gameRepository.createGame({
        createGameDto,
        project,
        user,
      });
      expect(result).toMatchObject(game);
    });

    it('game을 생성하는 데 내부 에러로 인해 실패한다', async () => {
      expect.assertions(2);

      jest.spyOn(gameRepository, 'create').mockReturnValue(game);
      jest.spyOn(gameRepository, 'save').mockImplementation(() => {
        throw new InternalServerErrorException(GAME_ERROR_MSG.FAIL_TO_CREATE);
      });

      try {
        const result = await gameRepository.createGame({
          createGameDto,
          project,
          user,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toEqual(GAME_ERROR_MSG.FAIL_TO_CREATE);
      }
    });
  });

  describe('toggleLike', () => {
    it('좋아요 추가에 성공한다', async () => {
      const message = '좋아요가 완료 되었습니다.';
      const toggleLikeResult = { message };

      jest
        .spyOn(gameRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: () => null,
          };
        });

      jest.spyOn(gameRepository, 'save').mockResolvedValue(undefined);

      const result = await gameRepository.toggleLike(game, user);
      expect(result).toMatchObject(toggleLikeResult);
    });

    it('좋아요 취소에 성공한다', async () => {
      const message = '좋아요가 취소 되었습니다.';
      const toggleLikeResult = { message };
      game.likes = [user];

      jest
        .spyOn(gameRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: () => game,
          };
        });

      jest.spyOn(gameRepository, 'save').mockResolvedValue(undefined);

      const result = await gameRepository.toggleLike(game, user);
      expect(result).toMatchObject(toggleLikeResult);
    });

    it('서버 에러로 인해 game의 like 추가가 실패한다', async () => {
      const message = '좋아요가 추가 되었습니다.';
      const toggleLikeResult = { message };

      jest
        .spyOn(gameRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: () => null,
          };
        });

      jest.spyOn(gameRepository, 'save').mockImplementation(() => {
        throw new Error();
      });

      try {
        const result = await gameRepository.toggleLike(game, user);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('findOneGame', () => {
    it('특정 게임을 찾는 데 성공한다', async () => {
      jest
        .spyOn(gameRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            leftJoin: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            loadRelationCountAndMap: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getOne: () => game,
          };
        });

      const result = await gameRepository.findOneGame(id);
      expect(result).toMatchObject(game);
    });
  });

  describe('findGames', () => {
    it('게임 목록을 조회하는 데에 성공한다', async () => {
      const totalCount = 1;
      const data = [game];
      jest
        .spyOn(gameRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            leftJoin: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            loadRelationCountAndMap: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            getManyAndCount: () => [data, totalCount],
          };
        });

      const findGamesResult = { totalCount, data };
      const page = 1;
      const pageSize = 1;
      const result = await gameRepository.findGames(page, pageSize);
      expect(result).toMatchObject(findGamesResult);
    });
  });

  describe('search', () => {
    it('게임 검색에 성공한다', async () => {
      const totalCount = 1;
      const data = [game];
      jest
        .spyOn(gameRepository, 'createQueryBuilder')
        .mockImplementation(() => {
          const mockModule = jest.requireMock('typeorm');
          return {
            ...mockModule,
            innerJoin: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orWhere: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            offset: jest.fn().mockReturnThis(),
            getManyAndCount: () => [data, totalCount],
          };
        });
      const searchResult = { totalCount, data };
      const page = 1;
      const pageSize = 1;
      const keyword = 'ti';
      const result = await gameRepository.search({ page, pageSize, keyword });
      expect(result).toMatchObject(searchResult);
    });
  });
});
