import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.createProject(createProjectDto);
  }

  @Get()
  async findAllProjects(@Query('page') page: string) {
    const limit = 5;
    const offset = page ? (Number(page) - 1) * limit : 0;
    const result = await this.projectsService.findAll({
      take: limit,
      skip: offset,
    });
    return result;
  }

  @Get('/:id')
  findProject(@Param('id') id: string) {
    return this.projectsService.findOne(+id);
  }
}
