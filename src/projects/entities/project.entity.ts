import { CoreEntity } from '../../core/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Project extends CoreEntity {
  @Column()
  title: string;

  @Column()
  code: string;

  @Column({ type: Boolean, default: false })
  isPublished: boolean;

  @ManyToOne((_type) => User, (user) => user.projects, {
    eager: true,
    onDelete: 'CASCADE',
  })
  user: User;
}
