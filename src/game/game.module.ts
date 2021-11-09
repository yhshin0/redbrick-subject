import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from 'src/projects/projects.module';
import { GameController } from './game.controller';
import { GameRepository } from './game.repository';
import { GameService } from './game.service';

@Module({
  imports: [TypeOrmModule.forFeature([GameRepository]), ProjectsModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
