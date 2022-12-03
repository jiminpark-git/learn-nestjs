# 2. [NestJS] TypeORM으로 데이터베이스 연동하기

> 이 글은 [NestJS 공식 문서](https://docs.nestjs.com/recipes/sql-typeorm) 기반으로 작성되었습니다.

## ORM(Object–relational mapping)

> 객체 관계 매핑은 데이터베이스와 객체 지향 프로그래밍 언어 간의 호환되지 않는 데이터를 변환하는 프로그래밍 기법이다. 객체 지향 언어에서 사용할 수 있는 "가상" 객체 데이터베이스를 구축하는 방법이다. - [wikipedia](https://ko.wikipedia.org/wiki/%EA%B0%9D%EC%B2%B4_%EA%B4%80%EA%B3%84_%EB%A7%A4%ED%95%91)

## TypeORM

> TypeORM은 NodeJS, Browser, Electron 등 다양한 플랫폼에서 실행할 수 있는 ORM이다. - [typeorm.io](https://typeorm.io/)

### TypeORM의 특징

- DataManager와 ActiveRecord 지원
- Entity 매니저
- 관계형
- 트랜잭션
- 마이그레이션
- ...

---

## TypeORM으로 데이터베이스 연동하기

### 1. 준비

#### 1.1. typeorm, mysql2 설치

```bash
$ yarn add typeorm mysql2
```

#### 1.2. board 데이터베이스에 board 테이블 생성 및 데이터 입력

```sql
CREATE TABLE board (
    uid     int auto_increment,
    title   varchar(20)  not null,
    content varchar(100) null,
    constraint board_pk primary key (uid)
);

INSERT INTO board(title, content) VALUE('제목', '내용');
```

### 2. DataSource로 데이터베이스 연결하기

#### 2.1. Configuration

`@nestjs/config` 패키지를 사용하여 DB 연동에 필요한 정보들을 외부 .env 파일에 저장하여 사용하려고 한다.

```bash
$ yarn add @nestjs/config
```

> @nestjs/config 패키지는 내부적으로 dotenv 를 사용합니다.

#### 2.2. database.providers.ts

```ts
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
```

#### 2.2. database.module.ts

```ts
@Module({
  imports: [DatabaseModule],
  controllers: [BoardController],
  providers: [...boardProviders, BoardService],
})
export class BoardModule {}
```

### 3. Repository Pattern

TypeORM Repository Pattern을 지원하므로 각 엔티티에 자체 `Repository`가 있다. (JPA와 유사)

#### 3.1. board.entity.ts

```ts
@Entity()
export class Board {
  @PrimaryColumn()
  uid: number;

  @Column({ length: 20 })
  title: string;

  @Column({ length: 100 })
  content: string;
}
```

#### 3.2. board.providers.ts

```ts
export const boardProviders = [
  {
    provide: 'BOARD_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Board),
    inject: ['DATA_SOURCE'],
  },
];
```

### 4. Service and Controller

#### 4.1. board.service.ts

```ts
@Injectable()
export class BoardService {
  constructor(
    @Inject('BOARD_REPOSITORY')
    private readonly boardRepository: Repository<Board>,
  ) {}

  async findAll(): Promise<Board[]> {
    return this.boardRepository.find();
  }
}
```

`@Inject` 데코레이터를 사용하여 BOARD_REPOSITORY 주입

#### 4.2. board.controller.ts

```ts
@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  getAll(): Promise<Board[]> {
    return this.boardService.findAll();
  }
}
```

### 5. Module

#### 5.1. board.module.ts

```ts
@Module({
  imports: [DatabaseModule],
  controllers: [BoardController],
  providers: [...boardProviders, BoardService],
})
export class BoardModule {}
```

#### 5.2. app.module.ts

```ts
@Module({
  imports: [BoardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 6. Test

코드 작성은 끝났으니 테스트를 해보자

```bash
$ nest start --watch
```

#### 6.1. GET /board

```json
[
  {
    "uid": 1,
    "title": "제목",
    "content": "내용"
  }
]
```

[1.2]에서 입력한 데이터가 정상적으로 JSON 형태로 반환되었다. :)
