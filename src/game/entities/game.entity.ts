import { CoreEntity } from '../../core/entities/core.entity';
import { Column, Entity, JoinColumn, ManyToMany, OneToOne } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';

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

  @OneToOne(() => Project, { eager: true })
  @JoinColumn()
  project: Project;

  @ManyToMany((_type) => User, (users) => users.games, { eager: true })
  likes: User[];
}
