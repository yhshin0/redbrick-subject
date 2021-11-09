import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CacheService } from '../cache/cache.service';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';

const mockProjectsRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
});

const mockSchedulerRegistry = () => ({
  getTimeouts: jest.fn(),
  deleteTimeout: jest.fn(),
  addTimeout: jest.fn(),
});

jest.mock('../cache/cache.service');

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepository: MockRepository<Project>;
  let cacheService: CacheService;
  let schedulerRegistry: SchedulerRegistry;

  const user = new User();
  user.id = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        CacheService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository(),
        },
        { provide: SchedulerRegistry, useValue: mockSchedulerRegistry() },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectRepository = module.get<MockRepository<Project>>(
      getRepositoryToken(Project),
    );
    cacheService = module.get<CacheService>(CacheService);
    schedulerRegistry = module.get<SchedulerRegistry>(SchedulerRegistry);
  });

  it('should be defined', () => {
    expect.assertions(2);
    expect(service).toBeDefined();
    expect(projectRepository).toBeDefined();
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

      const expectProject = await service.createProject(createProjectDto, user);
      expect(expectProject.id).toEqual(id);
      expect(expectProject.title).toEqual(title);
      expect(expectProject.code).toEqual(code);
      expect(expectProject.isPublished).toEqual(isPublished);
    });
  });

  describe('findAll', () => {
    it('프로젝트 목록 조회에 성공한다', async () => {
      const take = 5;
      const skip = 0;
      const totalCount = 1;
      projectRepository.count.mockResolvedValue(totalCount);

      const project = new Project();
      project.id = 1;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      const projectArr = [project];
      projectRepository.find.mockResolvedValue(projectArr);
      const expectResult = await service.findAll({ take, skip, user });
      expect(expectResult).toMatchObject({ totalCount, data: projectArr });
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

      const expectProject = await service.findOne(id);
      expect(expectProject.id).toEqual(project.id);
      expect(expectProject.title).toEqual(project.title);
      expect(expectProject.code).toEqual(project.code);
      expect(expectProject.isPublished).toEqual(project.isPublished);
    });

    it('특정 프로젝트 조회에 실패한다', async () => {
      expect.assertions(2);
      const notExistedId = 99999;
      projectRepository.findOne.mockResolvedValue(undefined);

      try {
        const expectProject = await service.findOne(notExistedId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('해당 project가 존재하지 않습니다.');
      }
    });

    describe('update', () => {
      it('프로젝트 수정에 성공한다', async () => {
        const id = 1;
        const updateIsPublished = true;
        const updateProjectDto = { isPublished: updateIsPublished };

        const project = new Project();
        project.id = id;
        project.title = 'title';
        project.code = 'code';
        project.isPublished = false;
        project.user = user;
        projectRepository.findOne.mockResolvedValue(project);

        jest.spyOn(schedulerRegistry, 'getTimeouts').mockReturnValue([]);

        jest.spyOn(cacheService, 'set').mockResolvedValue();
        const cacheData = { title: 'updatedTitle' };
        jest.spyOn(cacheService, 'get').mockResolvedValue(cacheData);

        jest.spyOn(schedulerRegistry, 'addTimeout').mockReturnValue();
        jest.spyOn(global, 'setTimeout').mockReturnValue(null);

        const expectProject = await service.update(id, updateProjectDto, user);
        expect(expectProject.title).toEqual(cacheData.title);
      });

      it('수정하려는 값이 없기 때문에 프로젝트 수정에 실패한다', async () => {
        expect.assertions(2);
        const id = 1;

        try {
          const expectProject = await service.update(id, Object(), user);
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(error.message).toEqual('요청하신 수정 값이 잘못되었습니다');
        }
      });

      it('프로젝트의 작성자가 아니기 때문에 프로젝트 수정에 실패한다', async () => {
        expect.assertions(2);
        const id = 1;
        const updateIsPublished = true;
        const updateProjectDto = { isPublished: updateIsPublished };

        const differentUser = new User();
        differentUser.id = 99999;
        const project = new Project();
        project.id = id;
        project.title = 'title';
        project.code = 'code';
        project.isPublished = false;
        project.user = differentUser;
        projectRepository.findOne.mockResolvedValue(project);
        try {
          const expectProject = await service.update(
            id,
            updateProjectDto,
            user,
          );
        } catch (error) {
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toEqual(
            '해당 프로젝트를 작성한 유저가 아닙니다',
          );
        }
      });
    });

    describe('delete', () => {
      it('프로젝트 삭제에 성공한다', async () => {
        expect.assertions(4);
        const id = 1;

        const project = new Project();
        project.id = id;
        project.title = 'title';
        project.code = 'code';
        project.isPublished = false;
        project.user = user;
        projectRepository.findOne.mockResolvedValue(project);

        projectRepository.softDelete.mockResolvedValue(null);

        const expectProject = await service.delete(id, user);
        expect(expectProject.id).toEqual(project.id);
        expect(expectProject.title).toEqual(project.title);
        expect(expectProject.code).toEqual(project.code);
        expect(expectProject.isPublished).toEqual(project.isPublished);
      });

      it('프로젝트의 작성자가 아니기 때문에 프로젝트 삭제에 실패한다', async () => {
        expect.assertions(2);
        const id = 1;

        const differentUser = new User();
        differentUser.id = 99999;
        const project = new Project();
        project.id = id;
        project.title = 'title';
        project.code = 'code';
        project.isPublished = false;
        project.user = differentUser;
        projectRepository.findOne.mockResolvedValue(project);
        try {
          const expectProject = await service.delete(id, user);
        } catch (error) {
          expect(error).toBeInstanceOf(UnauthorizedException);
          expect(error.message).toEqual(
            '해당 프로젝트를 작성한 유저가 아닙니다',
          );
        }
      });
    });
  });
});
