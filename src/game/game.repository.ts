import { EntityRepository, Repository } from 'typeorm';
import { Game } from './entities/game.entity';

@EntityRepository(Game)
export class GameRepository extends Repository<Game> {}
