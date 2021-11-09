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
import { Game } from '../../game/entities/game.entity';

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
    eager: false,
    cascade: true,
  })
  projects: Project[];

  @OneToMany((_type) => Game, (game) => game.user, {
    eager: false,
    cascade: true,
  })
  games: Game[];


  @ManyToMany((_type) => Game, (game) => game.likes, {
    cascade: true,
  })
  @JoinTable({ name: 'users_likes' })
  likes: Game[];
}
