import {
  Body,
  Controller,
  Delete,
  forwardRef,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Connection } from 'typeorm';

import { GetUser } from '../auth/get-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { GameService } from '../game/game.service';
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
  constructor(
    private readonly projectsService: ProjectsService,
    @Inject(forwardRef(() => GameService))
    private readonly gameService: GameService,
    private connection: Connection,
  ) {}

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
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const project = await this.projectsService.findOne(+id);

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
      await this.projectsService.update(
        project.id,
        { isPublished: true },
        user,
      );
      await queryRunner.commitTransaction();
      return { message: 'publish complete' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return { message: 'publish fail' };
    } finally {
      await queryRunner.release();
    }
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
