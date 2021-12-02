import {
  BadRequestException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, QueryRunner, Repository } from 'typeorm';

import { CacheService } from '../cache/cache.service';
import { User } from '../users/entities/user.entity';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { GameService } from '../game/game.service';
import { PROJECT_ERROR_MSG } from './projects.constants';
import { UpdateProjectDto } from './dto/update-project.dto';

const mockProjectsRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  softDelete: jest.fn(),
});

const mockSchedulerRegistry = () => ({
  getTimeouts: jest.fn(),
  deleteTimeout: jest.fn(),
  addTimeout: jest.fn(),
});

jest.mock('../cache/cache.service');
jest.mock('../game/game.service');

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProjectsService', () => {
  let projectsService: ProjectsService;
  let projectRepository: MockRepository<Project>;
  let cacheService: CacheService;
  let gameService: GameService;
  let schedulerRegistry: SchedulerRegistry;
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
      providers: [
        ProjectsService,
        CacheService,
        GameService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository(),
        },
        { provide: SchedulerRegistry, useValue: mockSchedulerRegistry() },
        { provide: Connection, useClass: ConnectionMock },
      ],
    }).compile();

    projectsService = module.get<ProjectsService>(ProjectsService);
    projectRepository = module.get<MockRepository<Project>>(
      getRepositoryToken(Project),
    );
    cacheService = module.get<CacheService>(CacheService);
    gameService = module.get<GameService>(GameService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
    connection = module.get<Connection>(Connection);
  });

  it('should be defined', () => {
    expect.assertions(6);
    expect(projectsService).toBeDefined();
    expect(projectRepository).toBeDefined();
    expect(cacheService).toBeDefined();
    expect(gameService).toBeDefined();
    expect(schedulerRegistry).toBeDefined();
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
      projectRepository.create.mockReturnValue(project);
      projectRepository.save.mockResolvedValue({
        id,
        title,
        code,
        isPublished,
      });

      const expectProject = await projectsService.createProject(
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

    it('프로젝트를 처음 퍼블리싱하여 성공한다', async () => {
      expect.assertions(2);

      const project = new Project();
      project.id = 1;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      project.user = user;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      jest
        .spyOn(ProjectsService.prototype as any, 'checkAuthor')
        .mockReturnValue(undefined);
      jest
        .spyOn(ProjectsService.prototype as any, 'createNewGame')
        .mockResolvedValue(undefined);

      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
      jest.spyOn(queryRunner, 'commitTransaction').mockResolvedValue();
      const result = await projectsService.publishProject({
        id,
        publishProjectDto,
        user,
      });

      const mockCreateNewGame = jest.spyOn(
        ProjectsService.prototype as any,
        'createNewGame',
      );

      expect(mockCreateNewGame).toBeCalled();
      expect(result).toMatchObject({ message: 'publish complete' });
    });

    it('퍼블리싱했던 게임과 매치되는 프로젝트를 다시 퍼블리싱하여 성공한다', async () => {
      expect.assertions(2);

      const project = new Project();
      project.id = 1;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = true;
      project.user = user;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      jest
        .spyOn(ProjectsService.prototype as any, 'checkAuthor')
        .mockReturnValue(undefined);

      jest
        .spyOn(ProjectsService.prototype as any, 'updatePublishedGame')
        .mockResolvedValue(undefined);

      jest.spyOn(projectRepository, 'save').mockResolvedValue(project);
      jest.spyOn(queryRunner, 'commitTransaction').mockResolvedValue();
      const result = await projectsService.publishProject({
        id,
        publishProjectDto,
        user,
      });

      const mockUpdatePublishedGame = jest.spyOn(
        ProjectsService.prototype as any,
        'updatePublishedGame',
      );

      expect(mockUpdatePublishedGame).toBeCalled();
      expect(result).toMatchObject({ message: 'publish complete' });
    });

    it('퍼블리싱 하려는 프로젝트의 작성자가 아니면 실패한다', async () => {
      expect.assertions(3);

      const differentUser = new User();
      differentUser.id = 9999;

      const project = new Project();
      project.id = 1;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = true;
      project.user = differentUser;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      jest
        .spyOn(ProjectsService.prototype as any, 'checkAuthor')
        .mockImplementation(() => {
          throw new UnauthorizedException(PROJECT_ERROR_MSG.NOT_AUTHOR);
        });

      jest
        .spyOn(queryRunner, 'rollbackTransaction')
        .mockResolvedValue(undefined);
      try {
        const result = await projectsService.publishProject({
          id,
          publishProjectDto,
          user,
        });
      } catch (error) {
        const mockRollbackTransaction = jest.spyOn(
          queryRunner,
          'rollbackTransaction',
        );
        expect(mockRollbackTransaction).toBeCalled();
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(PROJECT_ERROR_MSG.NOT_AUTHOR);
      }
    });
  });

  describe('findAll', () => {
    it('프로젝트 목록 조회에 성공한다', async () => {
      const project = new Project();
      project.id = 1;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      const projectArr = [project];
      const totalCount = 1;
      const findAndCountResult = [projectArr, totalCount];
      projectRepository.findAndCount.mockResolvedValue(findAndCountResult);

      const page = 1;
      const pageSize = 5;
      const result = await projectsService.findAll({ page, pageSize, user });
      expect(result).toMatchObject({ totalCount, data: projectArr });
    });
  });

  describe('findOne', () => {
    it('특정 프로젝트 조회에 성공한다', async () => {
      expect.assertions(4);

      const id = 1;
      const project = new Project();
      project.id = id;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      projectRepository.findOne.mockResolvedValue(project);

      const result = await projectsService.findOne(id);
      expect(result.id).toEqual(project.id);
      expect(result.title).toEqual(project.title);
      expect(result.code).toEqual(project.code);
      expect(result.isPublished).toEqual(project.isPublished);
    });

    it('특정 프로젝트 조회에 실패한다', async () => {
      expect.assertions(2);

      const notExistedId = 99999;
      projectRepository.findOne.mockResolvedValue(undefined);

      try {
        const result = await projectsService.findOne(notExistedId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual(PROJECT_ERROR_MSG.NOT_FOUND_PROJECT);
      }
    });
  });

  describe('update', () => {
    const updateTitle = 'updateTitle';
    const updateCode = 'updateCode';
    const updateProjectDto = { title: updateTitle, code: updateCode };

    const id = 1;

    it('프로젝트 수정에 성공한다', async () => {
      const project = new Project();
      project.id = id;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      project.user = user;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      jest
        .spyOn(ProjectsService.prototype as any, 'checkAuthor')
        .mockReturnValue(undefined);

      jest.spyOn(schedulerRegistry, 'getTimeouts').mockReturnValue([]);

      jest.spyOn(cacheService, 'setCacheData').mockResolvedValue(undefined);
      const cacheData = { ...updateProjectDto };
      jest.spyOn(cacheService, 'getCacheData').mockResolvedValue(cacheData);

      jest.spyOn(schedulerRegistry, 'addTimeout').mockReturnValue();
      jest.spyOn(global, 'setTimeout').mockReturnValue(null);

      const result = await projectsService.update({
        id,
        updateProjectDto,
        user,
      });
      expect(result).toMatchObject(cacheData);
    });

    it('수정하려는 값이 없기 때문에 프로젝트 수정에 실패한다', async () => {
      expect.assertions(2);

      try {
        const result = await projectsService.update({
          id,
          updateProjectDto: new UpdateProjectDto(),
          user,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toEqual(PROJECT_ERROR_MSG.NO_VALUE_FOR_UPDATE);
      }
    });

    it('프로젝트의 작성자가 아니기 때문에 프로젝트 수정에 실패한다', async () => {
      expect.assertions(2);

      const differentUser = new User();
      differentUser.id = 99999;
      const project = new Project();
      project.id = id;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      project.user = differentUser;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      jest
        .spyOn(ProjectsService.prototype as any, 'checkAuthor')
        .mockImplementation(() => {
          throw new UnauthorizedException(PROJECT_ERROR_MSG.NOT_AUTHOR);
        });

      try {
        const result = await projectsService.update({
          id,
          updateProjectDto,
          user,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual(PROJECT_ERROR_MSG.NOT_AUTHOR);
      }
    });
  });

  describe('delete', () => {
    const id = 1;

    it('프로젝트 삭제에 성공한다', async () => {
      const project = new Project();
      project.id = id;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      project.user = user;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      jest
        .spyOn(ProjectsService.prototype as any, 'checkAuthor')
        .mockReturnValue(undefined);

      projectRepository.softDelete.mockResolvedValue(undefined);

      const result = await projectsService.delete(id, user);
      expect(result).toMatchObject({ message: 'project가 삭제되었습니다' });
    });

    it('프로젝트의 작성자가 아니기 때문에 프로젝트 삭제에 실패한다', async () => {
      expect.assertions(2);

      const differentUser = new User();
      differentUser.id = 99999;
      const project = new Project();
      project.id = id;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      project.user = differentUser;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      jest
        .spyOn(ProjectsService.prototype as any, 'checkAuthor')
        .mockImplementation(() => {
          throw new UnauthorizedException(PROJECT_ERROR_MSG.NOT_AUTHOR);
        });

      try {
        const result = await projectsService.delete(id, user);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual(PROJECT_ERROR_MSG.NOT_AUTHOR);
      }
    });
  });
});
