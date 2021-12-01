import { Column, Entity, ManyToOne } from 'typeorm';

import { CoreEntity } from '../../core/entities/core.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Project extends CoreEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  code: string;

  @Column({ type: Boolean, default: false })
  isPublished: boolean;

  @ManyToOne(() => User, (user) => user.projects, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;
}
