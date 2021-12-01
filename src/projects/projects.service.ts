import {
  BadRequestException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';

import { CacheService } from '../cache/cache.service';
import { User } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { IFindAllResponse, IProjectInfoForPublish } from './projects.interface';
import { GameService } from '../game/game.service';
import { PublishProjectDto } from './dto/publish-project.dto';
import { PROJECT_CONSTANTS, PROJECT_ERROR_MSG } from './projects.constants';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly cacheService: CacheService,
    private schedulerRegistry: SchedulerRegistry,
    @Inject(forwardRef(() => GameService))
    private readonly gameService: GameService,
    private connection: Connection,
  ) {}

  async createProject(
    createProjectDto: CreateProjectDto,
    user: User,
  ): Promise<Project> {
    try {
      return await this.projectRepository.save(
        this.projectRepository.create({ ...createProjectDto, user }),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        PROJECT_ERROR_MSG.ERROR_FOR_CREATE,
      );
    }
  }

  async publishProject({
    id,
    publishProjectDto,
    user,
  }: {
    id: number;
    publishProjectDto: PublishProjectDto;
    user: User;
  }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = await this.findOne(id);

      this.checkAuthor(project, user);
      if (!project.isPublished) {
        // 프로젝트가 퍼블리싱 된 적이 없는 경우(게임이 없는 경우) 게임 생성
        await this.createNewGame({ project, publishProjectDto, user });
      } else {
        // 퍼블리싱 된 적이 있는 경우(게임이 존재하는 경우) 게임 수정
        await this.updatePublishedGame({ project, publishProjectDto, user });
      }

      await this.projectRepository.save({ id: project.id, isPublished: true });

      await queryRunner.commitTransaction();
      return { message: 'publish complete' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw new HttpException(error.getResponse(), error.getStatus());
      } else {
        throw new InternalServerErrorException();
      }
    } finally {
      await queryRunner.release();
    }
  }

  async findAll({
    page,
    pageSize,
    user,
  }: {
    page: number;
    pageSize: number;
    user: User;
  }): Promise<IFindAllResponse> {
    page =
      isNaN(page) || page <= 0 ? PROJECT_CONSTANTS.LIST_DEFAULT_PAGE : page - 1;
    pageSize =
      isNaN(pageSize) || pageSize <= 0
        ? PROJECT_CONSTANTS.LIST_DEFAULT_PAGE_SIZE
        : pageSize;

    const data = await this.projectRepository.findAndCount({
      where: { user },
      skip: page * pageSize,
      take: pageSize,
    });

    return {
      totalCount: data[1],
      data: data[0],
    };
  }

  async findOne(id: number): Promise<Project> {
    const existedProject = await this.projectRepository.findOne({ id });
    if (!existedProject) {
      throw new NotFoundException(PROJECT_ERROR_MSG.NOT_FOUND_PROJECT);
    }
    return existedProject;
  }

  async update({
    id,
    updateProjectDto,
    user,
  }: {
    id: number;
    updateProjectDto: UpdateProjectDto;
    user: User;
  }): Promise<any> {
    if (Object.keys(updateProjectDto).length === 0) {
      throw new BadRequestException(PROJECT_ERROR_MSG.NO_VALUE_FOR_UPDATE);
    }

    const project = await this.findOne(id);
    this.checkAuthor(project, user);

    const timeoutList = this.schedulerRegistry.getTimeouts();
    const timeoutKey = PROJECT_CONSTANTS.TIMEOUT_KEY_PREFIX + id;
    if (timeoutList.includes(timeoutKey)) {
      this.schedulerRegistry.deleteTimeout(timeoutKey);
    }

    const cacheKey = PROJECT_CONSTANTS.CACHE_KEY_PREFIX + id;
    await this.cacheService.setCacheData(cacheKey, updateProjectDto);
    const cacheData = await this.cacheService.getCacheData(cacheKey);

    this.schedulerRegistry.addTimeout(
      timeoutKey,
      setTimeout(async () => {
        project.title = cacheData.title;
        project.code = cacheData.code;
        await this.projectRepository.save(project);
      }, PROJECT_CONSTANTS.MILLISECONDS_FOR_TIMEOUT),
    );
    return cacheData;
  }

  async delete(id: number, user: User): Promise<Project> {
    const project = await this.findOne(id);
    this.checkAuthor(project, user);

    await this.projectRepository.softDelete({ id });
    return project;
  }

  private checkAuthor(project: Project, user: User): void {
    if (project.user.id !== user.id) {
      throw new UnauthorizedException(PROJECT_ERROR_MSG.NOT_AUTHOR);
    }
  }

  private async createNewGame({
    project,
    publishProjectDto,
    user,
  }: IProjectInfoForPublish): Promise<void> {
    const createGameDto = {
      title: project.title,
      ...publishProjectDto,
      code: project.code,
      projectId: project.id,
    };
    await this.gameService.createGame({ createGameDto, project, user });
  }

  private async updatePublishedGame({
    project,
    publishProjectDto,
    user,
  }: IProjectInfoForPublish): Promise<void> {
    const game = await this.gameService.getPublishedGame(project);
    let updateGameDto;
    updateGameDto = Object.assign(
      {},
      { title: project.title, code: project.code, ...publishProjectDto },
    );

    if (game.deletedAt) {
      // 게임이 삭제된 적이 있는 경우
      await this.gameService.restoreGame(game.id);
      updateGameDto = { ...updateGameDto, createdAt: new Date() };
    }

    await this.gameService.updateGame({ id: game.id, updateGameDto, user });
  }
}
