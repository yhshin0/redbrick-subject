import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../users/entities/user.entity';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';

jest.mock('./game.service');

describe('GameController', () => {
  let gameController: GameController;
  let gameService: GameService;

  const id = '1';
  const title = 'title';
  const description = 'description';
  const code = 'code';
  const viewCount = 0;
  const game = new Game();

  const email = 'testuser@asdf.com';
  const user = new User();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [GameService],
    }).compile();

    gameController = module.get<GameController>(GameController);
    gameService = module.get<GameService>(GameService);

    game.id = +id;
    game.title = title;
    game.description = description;
    game.code = code;
    game.viewCount = viewCount;

    user.id = +id;
    user.email = email;
  });

  it('should be defined', () => {
    expect.assertions(2);
    expect(gameController).toBeDefined();
    expect(gameService).toBeDefined();
  });

  describe('getGames', () => {
    it('game 목록을 조회하는 데 성공한다', async () => {
      const gameArr = [game];
      const getGamesResult = { totalCount: gameArr.length, data: gameArr };
      jest.spyOn(gameService, 'getGames').mockResolvedValue(getGamesResult);

      const page = '1';
      const pageSize = '1';

      const result = await gameController.getGames(page, pageSize);
      expect(result).toMatchObject(getGamesResult);
    });
  });

  describe('search', () => {
    it('game을 검색하는 데 성공한다', async () => {
      const gameArr = [game];
      const getGamesResult = { totalCount: gameArr.length, data: gameArr };
      jest.spyOn(gameService, 'search').mockResolvedValue(getGamesResult);

      const page = '1';
      const pageSize = '1';
      const keyword = 'ti';

      const result = await gameController.search(keyword, page, pageSize);
      expect(result).toMatchObject(getGamesResult);
    });
  });

  describe('increaseCount', () => {
    it('game 조회수를 증가하는 데 성공한다', async () => {
      game.viewCount++;
      jest.spyOn(gameService, 'increaseCount').mockResolvedValue(game);

      const result = await gameController.increaseCount(id);
      expect(result).toMatchObject(game);
    });
  });

  describe('toggleLike', () => {
    it('game에 like를 하는 것에 성공한다', async () => {
      const message = '좋아요가 완료 되었습니다.';
      const gameServiceToggleLikeResult = { message };
      jest
        .spyOn(gameService, 'toggleLike')
        .mockResolvedValue(gameServiceToggleLikeResult);

      const result = await gameController.toggleLike(id, user);
      expect(result).toMatchObject(gameServiceToggleLikeResult);
    });
  });

  describe('getGameById', () => {
    it('특정 game을 조회하는 데 성공한다', async () => {
      jest.spyOn(gameService, 'getGameById').mockResolvedValue(game);

      const result = await gameController.getGameById(id);
      expect(result).toMatchObject(game);
    });
  });

  describe('updateGame', () => {
    it('game을 수정하는 데 성공한다', async () => {
      const updateCode = 'updateCode';
      const updateGameDto = new UpdateGameDto();
      updateGameDto.code = updateCode;

      game.code = updateCode;

      jest.spyOn(gameService, 'updateGame').mockResolvedValue(game);

      const result = await gameController.updateGame(id, updateGameDto, user);
      expect(result).toMatchObject(game);
    });
  });

  describe('deleteGame', () => {
    it('game을 삭제하는 데 성공한다', async () => {
      const message = '게임 삭제 완료';
      const gameServiceDeleteResult = { message };
      jest
        .spyOn(gameService, 'deleteGame')
        .mockResolvedValue(gameServiceDeleteResult);

      const result = await gameController.deleteGame(id, user);
      expect(result).toMatchObject(gameServiceDeleteResult);
    });
  });
});
