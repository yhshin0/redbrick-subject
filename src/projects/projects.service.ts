import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
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
}
