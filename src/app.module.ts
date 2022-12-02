import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Board } from './board/board.entity';
import { BoardModule } from './board/board.module';
import { Comment } from './board/comment.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { UserRole } from './user/user-role.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql', // 사용할 데이터베이스
        host: '127.0.0.1', // 호스트
        port: 3306, // 포트
        username: configService.get<string>('DATABASE_USERNAME'), // 사용자명
        password: configService.get<string>('DATABASE_PASSWORD'), // 비밀번호
        database: 'board', // 데이터베이스
        entities: [Board, Comment, User, UserRole], // 인식할 엔티티
        synchronize: false, // true로 설정 시 소스코드 기반으로 데이터베이스 스키마를 동기화
      }),
    }),
    BoardModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
