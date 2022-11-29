import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql', // 사용할 데이터베이스
        host: '127.0.0.1', // 호스트
        port: 3306, // 포트
        username: process.env.DATABASE_USERNAME, // 사용자명
        password: process.env.DATABASE_PASSWORD, // 비밀번호
        database: 'board', // 데이터베이스
        entities: [__dirname + '/../**/*.entity{.ts,.js}'], // 인식할 엔티티 클래스 경로
        synchronize: false, // true로 설정 시 소스코드 기반으로 데이터베이스 스키마를 동기화
      });

      return dataSource.initialize(); // dataSource로 데이터베이스 연결
    },
  },
];
