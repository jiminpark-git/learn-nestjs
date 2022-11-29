import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Board } from './board/board.entity';
import { BoardModule } from './board/board.module';
import { Comment } from './comment/comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.database.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql', // 사용할 데이터베이스
      host: '127.0.0.1', // 호스트
      port: 3306, // 포트
      username: process.env.DATABASE_USERNAME, // 사용자명
      password: process.env.DATABASE_PASSWORD, // 비밀번호
      database: 'board', // 데이터베이스
      entities: [Board, Comment], // 인식할 엔티티
      synchronize: false, // true로 설정 시 소스코드 기반으로 데이터베이스 스키마를 동기화
      logging: true, // SQL 로깅 활성화
    }),
    BoardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
