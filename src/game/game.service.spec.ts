import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { GameRepository } from './game.repository';
import { GameService } from './game.service';
import { GAME_ERROR_MSG } from './game.constants';
import { UpdateGameDto } from './dto/update-game.dto';

const mockGameRepository = () => ({
  findGames: jest.fn(),
  findOneGame: jest.fn(),
  createGame: jest.fn(),
  restore: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  toggleLike: jest.fn(),
  getCount: jest.fn(),
  getMany: jest.fn(),
  search: jest.fn(),
});

const mockUser = new User();
mockUser.id = 1;
mockUser.email = 'test@test.com';
mockUser.nickname = 'nickname';

const mockProject = new Project();
mockProject.id = 1;
mockProject.title = 'project title';
mockProject.code = 'project code';
mockProject.user = mockUser;

const mockGameResult = {
  id: 1,
  title: 'game title',
  description: 'game description',
  code: 'game code',
  viewCount: 1,
  user: mockUser,
};

describe('GameService', () => {
  let gameService: GameService;
  let gameRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: GameRepository, useFactory: mockGameRepository },
      ],
    }).compile();

    gameService = module.get(GameService);
    gameRepository = module.get(GameRepository);
  });

  it('should be defined', () => {
    expect.assertions(2);
    expect(gameService).toBeDefined();
    expect(gameRepository).toBeDefined();
  });

  describe('createGame', () => {
    const mockCreateGameDto = {
      title: 'game',
      description: 'game description',
      code: 'game code',
      projectId: 1,
    };

    it('Game을 생성하고 Game 리턴', async () => {
      gameRepository.createGame.mockResolvedValue(mockGameResult);
      const result = await gameService.createGame({
        createGameDto: mockCreateGameDto,
        project: mockProject,
        user: mockUser,
      });
      expect(result).toEqual(mockGameResult);
    });

    it('Game을 생성 실패 시 에러 리턴', async () => {
      gameRepository.createGame.mockResolvedValue(null);
      try {
        await gameService.createGame({
          createGameDto: mockCreateGameDto,
          project: mockProject,
          user: mockUser,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('getGames', () => {
    it('전체 조회 후 Game[] 리턴', async () => {
      const findGamesResult = { totalCount: 1, data: [mockGameResult] };
      gameRepository.findGames.mockResolvedValue(findGamesResult);
      const result = await gameService.getGames(0, 0);
      expect(result).toEqual(findGamesResult);
    });
  });

  describe('getGameById', () => {
    it('id로 조회 후 Game 리턴', async () => {
      gameRepository.findOneGame.mockResolvedValue(mockGameResult);
      const result = await gameService.getGameById(1);
      expect(result).toEqual(mockGameResult);
    });

    it('조회되지 않는 id일 경우 에러 리턴', async () => {
      expect.assertions(2);
      gameRepository.findOneGame.mockResolvedValue(null);

      try {
        const result = await gameService.getGameById(1);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual(GAME_ERROR_MSG.INVALID_GAME_ID);
      }
    });
  });

  describe('increaseCount', () => {
    it('게임의 조회수 증가에 성공한다', async () => {
      gameRepository.findOneGame.mockResolvedValue(mockGameResult);

      mockGameResult.viewCount++;
      const savedGame = Object.assign({}, { ...mockGameResult });
      gameRepository.save.mockResolvedValue(savedGame);

      const result = await gameService.increaseCount(mockGameResult.id);
      expect(result.viewCount).toEqual(savedGame.viewCount);
    });

    it('내부 에러로 인해 게임의 조회수 증가에 실패한다', async () => {
      gameRepository.findOneGame.mockResolvedValue(mockGameResult);

      mockGameResult.viewCount++;
      const savedGame = Object.assign({}, { ...mockGameResult });
      gameRepository.save.mockImplementation(() => {
        throw new Error();
      });

      try {
        const result = await gameService.increaseCount(mockGameResult.id);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });

  describe('getPublishedGame', () => {
    it('publish 된 게임 조회에 성공한다', async () => {
      gameRepository.findOne.mockResolvedValue(mockGameResult);
      const result = await gameService.getPublishedGame(mockProject);
      expect(result).toMatchObject(mockGameResult);
    });

    it('publish 된 게임이 존재하지 않아 조회에 실패한다', async () => {
      expect.assertions(2);
      gameRepository.findOne.mockResolvedValue(null);
      try {
        const result = await gameService.getPublishedGame(mockProject);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual(GAME_ERROR_MSG.INVALID_GAME_ID);
      }
    });
  });

  describe('restoreGame', () => {
    it('삭제 된 게임을 restore 하고 리턴 void', async () => {
      await gameService.restoreGame(1);
      let func = jest.fn();
      (func as jest.Mock) = gameRepository.restore;
      expect(func).toBeCalled();
    });
  });

  describe('updateGame', () => {
    const mockUpdateGameDto = {
      title: 'game title',
      description: 'game description',
      code: 'game code',
      createdAt: new Date(),
    };

    it('Game을 update하고 Game 리턴', async () => {
      gameRepository.findOneGame.mockResolvedValue(mockGameResult);
      gameRepository.update.mockResolvedValue(mockGameResult);
      const result = await gameService.updateGame({
        id: 1,
        updateGameDto: mockUpdateGameDto,
        user: mockUser,
      });
      expect(result).toEqual(mockGameResult);
    });

    it('수정 사항이 존재하지 않아 수정에 실패한다', async () => {
      const id = 1;
      const updateGameDto = new UpdateGameDto();

      try {
        const result = await gameService.updateGame({
          id,
          updateGameDto,
          user: mockUser,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(GAME_ERROR_MSG.NO_VALUE_FOR_UPDATE);
      }
    });

    it('유효한 게임 id가 아닐 시 에러 리턴', async () => {
      expect.assertions(2);
      gameRepository.findOneGame.mockResolvedValue(null);
      try {
        const result = await gameService.updateGame({
          id: 1,
          updateGameDto: mockUpdateGameDto,
          user: mockUser,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual(GAME_ERROR_MSG.INVALID_GAME_ID);
      }
    });

    it('게임의 작성자가 아니어서 수정에 실패한다', async () => {
      gameRepository.findOneGame.mockResolvedValue(mockGameResult);
      jest
        .spyOn(GameService.prototype as any, 'checkAuthor')
        .mockImplementation(() => new UnauthorizedException());
      try {
        const result = await gameService.updateGame({
          id: 1,
          updateGameDto: mockUpdateGameDto,
          user: mockUser,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual(GAME_ERROR_MSG.NOT_AUTHOR);
      }
    });
  });

  describe('deleteGame', () => {
    it('Game을 성공적으로 삭제', async () => {
      gameRepository.findOneGame.mockResolvedValue(mockGameResult);
      gameRepository.softDelete.mockResolvedValue(null);
      const result = await gameService.deleteGame(1, mockUser);
      expect(result).toEqual({ message: '게임 삭제 완료' });
    });

    it('유효한 게임 id가 아닐 시 에러 리턴', async () => {
      gameRepository.findOneGame.mockResolvedValue(mockGameResult);
      jest
        .spyOn(GameService.prototype as any, 'checkAuthor')
        .mockImplementation(() => new UnauthorizedException());
      try {
        const result = await gameService.deleteGame(1, mockUser);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual(GAME_ERROR_MSG.NOT_AUTHOR);
      }
    });
  });

  describe('toggleLike', () => {
    it('성공적으로 게임 좋아요 및 좋아요 취소 시 메세지 리턴', async () => {
      gameRepository.findOneGame.mockResolvedValue(mockGameResult);
      gameRepository.toggleLike.mockResolvedValue({ message: 'message' });
      const result = await gameService.toggleLike(1, mockUser);
      expect(result).toEqual({ message: 'message' });
    });
  });

  describe('search', () => {
    it('검색에 성공한다', async () => {
      const page = 1;
      const pageSize = 5;
      const keyword = 'title';

      const totalCount = 1;
      gameRepository.search.mockResolvedValue({
        totalCount,
        data: [mockGameResult],
      });

      const result = await gameService.search({ page, pageSize, keyword });
      expect(result).toMatchObject({ totalCount, data: [mockGameResult] });
    });
  });
});
