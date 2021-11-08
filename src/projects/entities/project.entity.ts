import { CoreEntity } from 'src/core/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Project extends CoreEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ type: Boolean, default: false })
  isPublished: boolean;

  // TODO: User 생성되면 연결할 것
  // @ManyToOne((_type) => User, (user) => user.projects, {
  //   eager: false,
  //   onDelete: 'CASCADE',
  // })
  // userId: number;
}
