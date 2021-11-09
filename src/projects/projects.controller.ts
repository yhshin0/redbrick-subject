import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { IFindAllResponse } from './projects.interface';
import { ProjectsService } from './projects.service';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() user: User,
  ): Promise<Project> {
    return this.projectsService.createProject(createProjectDto, user);
  }

  @Get()
  findAllProjects(
    @Query('page') page: string,
    @GetUser() user: User,
  ): Promise<IFindAllResponse> {
    const limit = 5;
    const offset = page ? (Number(page) - 1) * limit : 0;
    return this.projectsService.findAll({
      take: limit,
      skip: offset,
      user,
    });
  }

  @Get('/:id')
  findProject(@Param('id') id: string): Promise<Project> {
    return this.projectsService.findOne(+id);
  }

  @Patch('/:id')
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @GetUser() user: User,
  ): Promise<Project> {
    return this.projectsService.update(+id, updateProjectDto, user);
  }

  @Delete('/:id')
  deleteProject(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Project> {
    return this.projectsService.delete(+id, user);
  }
}
