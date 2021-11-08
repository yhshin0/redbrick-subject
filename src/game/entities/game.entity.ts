import { CoreEntity } from '../../core/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Game extends CoreEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  code: string;

  @Column({
    default: 0,
  })
  viewCount: number;
}
