import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../users/entities/user.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { PublishProjectDto } from './dto/publish-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

jest.mock('./projects.service');

describe('ProjectsService', () => {
  let projectsController: ProjectsController;
  let projectsService: ProjectsService;

  const user = new User();
  user.id = 1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [ProjectsService],
    }).compile();

    projectsController = module.get<ProjectsController>(ProjectsController);
    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect.assertions(2);
    expect(projectsController).toBeDefined();
    expect(projectsService).toBeDefined();
  });

  describe('createProject', () => {
    it('프로젝트를 생성한다', async () => {
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

      const result = await projectsController.createProject(
        createProjectDto,
        user,
      );
      expect(result).toMatchObject(project);
    });
  });

  describe('publishProject', () => {
    it('프로젝트 퍼블리싱에 처음으로 성공한다', async () => {
      const description = 'description';
      const publishProjectDto = new PublishProjectDto();
      publishProjectDto.description = description;

      const publishProjectResult = { message: 'publish complete' };
      jest
        .spyOn(projectsService, 'publishProject')
        .mockResolvedValue(publishProjectResult);

      const id = '1';
      const result = await projectsController.publishProject(
        id,
        publishProjectDto,
        user,
      );
      expect(result).toMatchObject(publishProjectResult);
    });
  });

  describe('findAllProjects', () => {
    it('프로젝트 목록 조회에 성공한다', async () => {
      const page = '1';
      const pageSize = '1';

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
      const result = await projectsController.findAllProjects(
        page,
        pageSize,
        user,
      );
      expect(result).toMatchObject({ totalCount, data: projectArr });
    });
  });

  describe('findProject', () => {
    it('특정 프로젝트 조회에 성공한다', async () => {
      const id = '1';
      const project = new Project();
      project.id = +id;
      project.title = 'title';
      project.code = 'code';
      project.isPublished = false;
      jest.spyOn(projectsService, 'findOne').mockResolvedValue(project);

      const result = await projectsController.findProject(id);
      expect(result).toMatchObject(project);
    });
  });

  describe('updateProject', () => {
    it('프로젝트 수정에 성공한다', async () => {
      const id = '1';
      const updateTitle = 'updateTitle';
      const updateCode = 'updateCode';
      const updateProjectDto = new UpdateProjectDto();
      updateProjectDto.title = updateTitle;
      updateProjectDto.code = updateCode;

      const project = new Project();
      project.id = +id;
      project.title = updateTitle;
      project.code = updateCode;
      project.isPublished = false;
      project.user = user;
      jest.spyOn(projectsService, 'update').mockResolvedValue(project);

      const result = await projectsController.updateProject(
        id,
        updateProjectDto,
        user,
      );
      expect(result).toMatchObject(project);
    });
  });

  describe('deleteProject', () => {
    it('프로젝트 삭제에 성공한다', async () => {
      const id = '1';

      const deleteResult = { message: 'project가 삭제되었습니다' };
      jest.spyOn(projectsService, 'delete').mockResolvedValue(deleteResult);

      const result = await projectsController.deleteProject(id, user);
      expect(result).toMatchObject(deleteResult);
    });
  });
});
