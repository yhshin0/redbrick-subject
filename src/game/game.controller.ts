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
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProjectsService } from 'src/projects/projects.service';
import { User } from 'src/users/entities/user.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { Game } from './entities/game.entity';
import { GameService } from './game.service';
@Controller('game')
export class GameController {
  constructor(
    private gameService: GameService,
    @Inject(forwardRef(() => ProjectsService))
    private projectsService: ProjectsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createGame(
    @Body() createGameDto: CreateGameDto,
    @GetUser() user: User,
  ): Promise<Game> {
    const { projectId } = createGameDto;
    const project = await this.projectsService.findOne(projectId);
    return await this.gameService.createGame(createGameDto, project, user);
  }

  @Get()
  getGames(@Query('page') page: string): Promise<Game[]> {
    const limit = 5;
    const offset = page ? (Number(page) - 1) * limit : 0;
    return this.gameService.getGames(limit, offset);
  }

  @Get('/:id')
  getGameById(@Param('id') id: string): Promise<Game> {
    return this.gameService.getGameById(Number(id), true);
  }

  @Patch('/:id')
  @UseGuards(JwtAuthGuard)
  updateGame(
    @Param('id') id: string,
    @Body() updateGameDto: UpdateGameDto,
    @GetUser() user: User,
  ): Promise<Game> {
    return this.gameService.updateGame(Number(id), updateGameDto, user);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  deleteGameById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.gameService.deleteGame(Number(id), user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/likes/:id')
  addOrRemoveLike(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.gameService.addOrRemoveLike(Number(id), user);
  }
}
