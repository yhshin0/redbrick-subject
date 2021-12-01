import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { GameRepository } from './game.repository';
import { GameService } from './game.service';

const mockGameRepository = () => ({
  findGames: jest.fn(),
  findOneGame: jest.fn(),
  createGame: jest.fn(),
  restore: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
  addOrRemoveLike: jest.fn(),
  getCount: jest.fn(),
  getMany: jest.fn(),
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

  describe('getGames', () => {
    it('전체 조회 후 Game[] 리턴', async () => {
      gameRepository.findGames.mockResolvedValue('someValue');
      const result = await gameService.getGames(0, 0);
      expect(result).toEqual('someValue');
    });
  });

  describe('getGameById', () => {
    it('id로 조회 후 Game 리턴', async () => {
      gameRepository.findOneGame.mockResolvedValue(mockGameResult);
      const result = await gameService.getGameById(1);
      expect(result).toEqual(mockGameResult);
    });

    it('조회되지 않는 id일 경우 에러 리턴', async () => {
      gameRepository.findOneGame.mockResolvedValue(null);
      expect(gameService.getGameById(0)).rejects.toThrow(NotFoundException);
    });
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
      const result = await gameService.createGame(
        mockCreateGameDto,
        mockProject,
        mockUser,
      );
      expect(result).toEqual(mockGameResult);
    });

    it('Game을 생성 실패 시 에러 리턴', async () => {
      gameRepository.createGame.mockResolvedValue(null);
      try {
        await gameService.createGame(mockCreateGameDto, mockProject, mockUser);
      } catch (error) {
        expect(error).toEqual(InternalServerErrorException);
      }
    });
  });

  describe('restoreGame', () => {
    it('삭제 된 게임을 restore 하고 리턴 void', async () => {
      const result = await gameService.restoreGame(1);
      expect(result).toEqual(undefined);
    });
  });

  describe('getGameByProjectId', () => {
    it('Project id로 조회 후 Game 리턴', async () => {
      gameRepository.findOne.mockResolvedValue(mockGameResult);
      const result = await gameService.getGameByProject(mockProject);
      expect(result).toEqual(mockGameResult);
    });

    it('조회되지 않는 id일 경우 에러 리턴', async () => {
      gameRepository.findOne.mockResolvedValue(null);
      expect(gameService.getGameByProject(mockProject)).rejects.toThrow(
        NotFoundException,
      );
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
      const result = await gameService.updateGame(
        1,
        mockUpdateGameDto,
        mockUser,
      );
      expect(result).toEqual(mockGameResult);
    });

    it('유효한 게임 id가 아닐 시 에러 리턴', async () => {
      gameRepository.update.mockResolvedValue(null);
      expect(
        gameService.updateGame(1, mockUpdateGameDto, mockUser),
      ).rejects.toThrow(NotFoundException);
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
      try {
        await gameService.deleteGame(1, mockUser);
      } catch (error) {
        expect(error).toEqual(UnauthorizedException);
      }
    });
  });

  describe('addOrRemoveLike', () => {
    it('성공적으로 게임 좋아요 및 좋아요 취소 시 메세지 리턴', async () => {
      gameRepository.findOne.mockResolvedValue(mockGameResult);
      gameRepository.addOrRemoveLike.mockResolvedValue({ message: 'message' });
      const result = await gameService.addOrRemoveLike(1, mockUser);
      expect(result).toEqual({ message: 'message' });
    });

    it('조회되지 않는 id일 경우 에러 리턴', async () => {
      gameRepository.findOne.mockResolvedValue(null);
      expect(gameService.addOrRemoveLike(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
