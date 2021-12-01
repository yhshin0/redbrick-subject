import {
  BadRequestException,
  forwardRef,
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
import { IFindAllResponse } from './projects.interface';
import { GameService } from '../game/game.service';
import { PublishProjectDto } from './dto/publish-project.dto';

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
        `Project 생성에 오류가 발생하였습니다.`,
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

      // user가 project 작성자인지 확인
      if (project.user.id !== user.id) {
        throw new UnauthorizedException('프로젝트의 작성자가 아닙니다');
      }

      if (!project.isPublished) {
        // 게임이 없는 경우 게임 생성
        const createGameDto = {
          title: project.title,
          ...publishProjectDto,
          code: project.code,
          projectId: project.id,
        };
        await this.gameService.createGame(createGameDto, project, user);
      } else {
        // 게임이 존재하는 경우 게임 수정
        const game = await this.gameService.getGameByProjectId(project);
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
        await this.gameService.updateGame(game.id, updateGameDto, user);
      }
      await this.projectRepository.save({ id: project.id, isPublished: true });
      await queryRunner.commitTransaction();
      return { message: 'publish complete' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { message: 'publish fail' };
    } finally {
      await queryRunner.release();
    }
  }

  async findAll({
    take,
    skip,
    user,
  }: {
    take: number;
    skip: number;
    user: User;
  }): Promise<IFindAllResponse> {
    // 로그인한 유저의 프로젝트만 볼 수 있도록 where절 사용
    const totalCount = await this.projectRepository.count({
      where: { user },
    });
    const data = await this.projectRepository.find({
      skip,
      take,
      where: { user },
    });
    return {
      totalCount,
      data,
    };
  }

  async findOne(id: number): Promise<Project> {
    const existedProject = await this.projectRepository.findOne({ id });
    if (!existedProject) {
      throw new NotFoundException('해당 project가 존재하지 않습니다.');
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
      throw new BadRequestException('요청하신 수정 값이 잘못되었습니다');
    }

    const project = await this.findOne(id);
    if (project.user.id !== user.id) {
      throw new UnauthorizedException('해당 프로젝트를 작성한 유저가 아닙니다');
    }

    const timeouts = this.schedulerRegistry.getTimeouts();
    if (timeouts.includes(`porject-timer-${id}`)) {
      this.schedulerRegistry.deleteTimeout(`porject-timer-${id}`);
    }

    await this.cacheService.set(`porject-${id}`, updateProjectDto);
    const cacheData = await this.cacheService.get(`porject-${id}`);
    this.schedulerRegistry.addTimeout(
      `porject-timer-${id}`,
      setTimeout(async () => {
        project.title = cacheData.title;
        project.code = cacheData.code;
        project.isPublished = cacheData.isPublished;
        await this.projectRepository.save(project);
      }, 1000 * 60),
    );
    return cacheData;
  }

  async delete(id: number, user: User): Promise<Project> {
    const project = await this.findOne(id);
    if (project.user.id !== user.id) {
      throw new UnauthorizedException('해당 프로젝트를 작성한 유저가 아닙니다');
    }

    await this.projectRepository.softDelete({ id });
    return project;
  }
}
