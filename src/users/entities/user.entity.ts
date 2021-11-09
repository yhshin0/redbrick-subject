import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CoreEntity } from '../../core/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';

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

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await bcrypt.hash(this.password, 10);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  // 나중에 프로젝트, 게임 테이블 생성되면 주석해제
  // @OneToMany((_type) => Project, (project) => project.user, {
  //   eager: true,
  //   cascade: true,
  // })
  // project: Project[];

  // @ManyToMany((_type) => Game, (game) => game.users, {
  //   cascade: true,
  // })
  // @JoinTable({ name: 'users_goods' })
  // games: Game[];
}
