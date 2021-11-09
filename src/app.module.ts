import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import { MemoryCacheModule } from './cache/cache.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'redbrick.db',
      entities: [__dirname + '/**/entities/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    ProjectsModule,
    UsersModule,
    GameModule,
    AuthModule,
    MemoryCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
