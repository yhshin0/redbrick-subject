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

import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { PublishProjectDto } from './dto/publish-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import {
  IFindAllResponse,
  IPublishResponseMessage,
} from './projects.interface';
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

  @Post('/publish/:id')
  async publishProject(
    @Param('id') id: string,
    @Body() publishProjectDto: PublishProjectDto,
    @GetUser() user: User,
  ): Promise<IPublishResponseMessage> {
    return await this.projectsService.publishProject({
      id: +id,
      publishProjectDto,
      user,
    });
  }

  @Get()
  findAllProjects(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @GetUser() user: User,
  ): Promise<IFindAllResponse> {
    return this.projectsService.findAll({
      page: +page,
      pageSize: +pageSize,
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
    return this.projectsService.update({ id: +id, updateProjectDto, user });
  }

  @Delete('/:id')
  deleteProject(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.projectsService.delete(+id, user);
  }
}
