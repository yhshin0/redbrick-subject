import { InternalServerErrorException } from '@nestjs/common';
import { Project } from 'src/projects/entities/project.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { CoreEntity } from '../../core/entities/core.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({ type: 'datetime', nullable: true })
  loginedAt: Date;

  //유저 생성시 암호화부분
  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  @OneToMany((_type) => Project, (project) => project.user, {
    eager: true,
    cascade: true,
  })
  projects: Project[];

  // @ManyToMany((_type) => Game, (game) => game.users, {
  //   cascade: true,
  // })
  // @JoinTable({ name: 'users_goods' })
  // games: Game[];
}
