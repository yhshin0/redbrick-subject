import { CoreEntity } from '../../core/entities/core.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Project extends CoreEntity {
  @Column()
  title: string;

  @Column()
  code: string;

  @Column({ type: Boolean, default: false })
  isPublished: boolean;

  @ManyToOne((_type) => User, (user) => user.projects, {
    eager: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
