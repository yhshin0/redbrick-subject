import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async createProject(createProjectDto: CreateProjectDto) {
    try {
      return await this.projectRepository.save(
        this.projectRepository.create(createProjectDto),
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Project 생성에 오류가 발생하였습니다.`,
      );
    }
  }

  async findAll({ take, skip }: { take: number; skip: number }) {
    const totalCount = await this.projectRepository.count();
    const data = await this.projectRepository.find({ skip, take });
    return {
      totalCount,
      data,
    };
  }

  async findOne(id: number) {
    const existedProject = await this.projectRepository.findOne({ id });
    if (!existedProject) {
      throw new NotFoundException('해당 project가 존재하지 않습니다.');
    }
    return existedProject;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id);
    project.title = updateProjectDto.title;
    project.code = updateProjectDto.code;
    project.isPublished = updateProjectDto.isPublished;
    return await this.projectRepository.save(project);
  }

  async delete(id: number) {
    const project = await this.findOne(id);
    await this.projectRepository.softDelete({ id });
    return project;
  }
}
