import { CoreEntity } from '../../core/entities/core.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Project } from 'src/projects/entities/project.entity';

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
}
