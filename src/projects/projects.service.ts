import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from '../cache/cache.service';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { IFindAllResponse } from './projects.interface';
import { SchedulerRegistry } from '@nestjs/schedule';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly cacheService: CacheService,
    private schedulerRegistry: SchedulerRegistry,
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

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    user: User,
  ): Promise<any> {
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

    await this.cacheService.set(`porject-${id}`, updateProjectDto );
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
