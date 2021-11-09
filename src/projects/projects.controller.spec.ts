import { Test, TestingModule } from '@nestjs/testing';
import { Connection, QueryRunner } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { GameService } from '../game/game.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { Game } from '../game/entities/game.entity';

jest.mock('./projects.service');
jest.mock('../game/game.service');

describe('ProjectsService', () => {
  let controller: ProjectsController;
  let projectsService: ProjectsService;
  let gameService: GameService;
  let connection: Connection;

  const qr = {
    manager: {},
  } as QueryRunner;

  class ConnectionMock {
    createQueryRunner(mode?: 'master' | 'slave'): QueryRunner {
      return qr;
    }
  }

  const user = new User();
  user.id = 1;

  beforeEach(async () => {
    Object.assign(qr.manager, {
      save: jest.fn(),
    });
    qr.connect = jest.fn();
    qr.release = jest.fn();
    qr.startTransaction = jest.fn();
    qr.commitTransaction = jest.fn();
    qr.rollbackTransaction = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        ProjectsService,
        GameService,
        { provide: Connection, useClass: ConnectionMock },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    projectsService = module.get<ProjectsService>(ProjectsService);
    gameService = module.get<GameService>(GameService);
    connection = module.get<Connection>(Connection);
  });

  it('should be defined', () => {
    expect.assertions(4);
    expect(controller).toBeDefined();
    expect(projectsService).toBeDefined();
    expect(gameService).toBeDefined();
    expect(connection).toBeDefined();
  });

  describe('createProject', () => {
    it('프로젝트를 생성한다', async () => {
      expect.assertions(4);
      const title = 'title';
      const code = 'code';
      const createProjectDto = { title, code };
      const id = 1;
      const isPublished = false;

      const project = new Project();
      project.id = id;
      project.title = title;
      project.code = code;
      project.isPublished = isPublished;
      jest.spyOn(projectsService, 'createProject').mockResolvedValue(project);

      const expectProject = await controller.createProject(
        createProjectDto,
        user,
      );
      expect(expectProject.id).toEqual(id);
      expect(expectProject.title).toEqual(title);
      expect(expectProject.code).toEqual(code);
      expect(expectProject.isPublished).toEqual(isPublished);
    });
  });

  describe('publishProject', () => {
    let id;
    let description;
    let publishProjectDto;
    let queryRunner: QueryRunner;

    beforeEach(() => {
      id = '1';
      description = 'description';
      publishProjectDto = { description };

      queryRunner = connection.createQueryRunner();
      jest.spyOn(queryRunner, 'connect').mockResolvedValueOnce(undefined);
      jest
        .spyOn(queryRunner, 'startTransaction')
        .mockResolvedValueOnce(undefined);
    });

    afterEach(() => {
      jest.spyOn(queryRunner, 'release').mockResolvedValue();
    });

    it('프로젝트 퍼블리싱에 처음으로 성공한다', async () => {
      const project = new Project();
      project.id = 1;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      project.user = user;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      const game = new Game();
      jest.spyOn(gameService, 'createGame').mockResolvedValue(game);

      jest.spyOn(projectsService, 'update').mockResolvedValue(project);
      jest.spyOn(queryRunner, 'commitTransaction').mockResolvedValue();
      const expectResult = await controller.publishProject(
        id,
        publishProjectDto,
        user,
      );
      expect(expectResult).toMatchObject({ message: 'publish complete' });
    });

    it('퍼블리싱 한 게임과 매치되는 프로젝트를 다시 퍼블리싱하여 성공한다', async () => {
      const project = new Project();
      project.id = 1;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = true;
      project.user = user;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      const game = new Game();
      jest.spyOn(gameService, 'getGameByProjectId').mockResolvedValue(game);

      jest.spyOn(gameService, 'updateGame').mockResolvedValue(game);

      jest.spyOn(projectsService, 'update').mockResolvedValue(project);
      jest.spyOn(queryRunner, 'commitTransaction').mockResolvedValue();
      const expectResult = await controller.publishProject(
        id,
        publishProjectDto,
        user,
      );
      expect(expectResult).toMatchObject({ message: 'publish complete' });
    });

    it('삭제한 게임에 매치되는 프로젝트를 다시 퍼블리싱하여 성공한다', async () => {
      const project = new Project();
      project.id = 1;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = true;
      project.user = user;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      const game = new Game();
      game.deletedAt = new Date();
      jest.spyOn(gameService, 'getGameByProjectId').mockResolvedValue(game);

      jest.spyOn(gameService, 'restoreGame').mockResolvedValue();

      jest.spyOn(gameService, 'updateGame').mockResolvedValue(game);

      jest.spyOn(projectsService, 'update').mockResolvedValue(project);
      jest.spyOn(queryRunner, 'commitTransaction').mockResolvedValue();
      const expectResult = await controller.publishProject(
        id,
        publishProjectDto,
        user,
      );
      expect(expectResult).toMatchObject({ message: 'publish complete' });
    });

    it('퍼블리싱 하려는 프로젝트의 작성자가 아니면 실패한다', async () => {
      const differentUser = new User();
      differentUser.id = 9999;
      const project = new Project();
      project.id = 1;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = true;
      project.user = differentUser;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      const expectResult = await controller.publishProject(
        id,
        publishProjectDto,
        user,
      );
      jest.spyOn(queryRunner, 'commitTransaction').mockResolvedValue();
      expect(expectResult).toMatchObject({ message: 'publish fail' });
    });
  });

  describe('findAllProjects', () => {
    it('프로젝트 목록 조회에 성공한다', async () => {
      const page = '1';
      const project = new Project();
      project.id = 1;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      project.user = user;
      const projectArr = [project];
      const totalCount = projectArr.length;
      jest
        .spyOn(projectsService, 'findAll')
        .mockResolvedValue({ totalCount, data: projectArr });
      const expectResult = await controller.findAllProjects(page, user);
      expect(expectResult).toMatchObject({ totalCount, data: projectArr });
    });
  });

  describe('findProject', () => {
    it('특정 프로젝트 조회에 성공한다', async () => {
      expect.assertions(4);
      const id = '1';
      const project = new Project();
      project.id = +id;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      const expectProject = await controller.findProject(id);
      expect(expectProject.id).toEqual(project.id);
      expect(expectProject.title).toEqual(project.title);
      expect(expectProject.code).toEqual(project.code);
      expect(expectProject.isPublished).toEqual(project.isPublished);
    });
  });

  describe('updateProject', () => {
    it('프로젝트 수정에 성공한다', async () => {
      expect.assertions(4);
      const id = '1';
      const updateIsPublished = true;
      const updateProjectDto = { isPublished: updateIsPublished };

      const project = new Project();
      project.id = +id;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      project.user = user;
      jest.spyOn(projectsService, 'update').mockResolvedValue(project);

      const expectProject = await controller.updateProject(
        id,
        updateProjectDto,
        user,
      );
      expect(expectProject.id).toEqual(project.id);
      expect(expectProject.title).toEqual(project.title);
      expect(expectProject.code).toEqual(project.code);
      expect(expectProject.isPublished).toEqual(project.isPublished);
    });
  });

  describe('deleteProject', () => {
    it('프로젝트 삭제에 성공한다', async () => {
      expect.assertions(4);
      const id = '1';

      const project = new Project();
      project.id = +id;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      project.user = user;
      jest.spyOn(projectsService, 'delete').mockResolvedValue(project);

      const expectProject = await controller.deleteProject(id, user);
      expect(expectProject.id).toEqual(project.id);
      expect(expectProject.title).toEqual(project.title);
      expect(expectProject.code).toEqual(project.code);
      expect(expectProject.isPublished).toEqual(project.isPublished);
    });
  });
});
