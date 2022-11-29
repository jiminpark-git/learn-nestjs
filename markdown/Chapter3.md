# 3. [NestJS] TypeORM으로 관계형 데이터베이스 연동하기

## 관계형 데이터베이스

> 관계형 데이터베이스는 **서로 관련된** 데이터 지점에 대한 접근을 저장 및 제공하는 데이터베이스 유형입니다. - [oracle](https://www.oracle.com/kr/database/what-is-a-relational-database/)

## TypeORM으로 관계형 데이터베이스 연동하기

### 1. 준비

#### 1.1. @nestjs/typeorm 설치

```bash
$ yarn add @nestjs/typeorm
```

#### 1.2. 테이블 생성과 데이터 입력

```sql
CREATE TABLE board
(
    uid     int auto_increment primary key,
    title   varchar(20)  not null,
    content varchar(100) null
);

CREATE TABLE comment (
    uid       int auto_increment primary key,
    content   varchar(50) not null,
    board_uid int         null,
    constraint comment_board_fk
        foreign key (board_uid) references board (uid)
            on delete cascade
);

INSERT INTO board(title, content) VALUE('제목', '내용');
INSERT INTO comment(content, board_uid) VALUES ('댓글1', 1), ('댓글2', 1);
```

### 2. Entity

#### 2.1. board.entity.ts

```ts
@Entity({ name: 'board' })
export class Board {
  @PrimaryGeneratedColumn('increment')
  uid: number;

  @Column({ type: 'varchar', length: 20 })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  content: string;

  @OneToMany(() => Comment, (comment) => comment.board, {
    cascade: true,
    eager: true,
  })
  comments: Comment[];
}
```

`@OneToMany` 데코레이터로 comment 테이블과의 관계 명시

- `cascade` 속성으로 cascade 설정
- `eager` 속성으로 엔티티 조회 시 자동 Join 설정

#### 2.2. comment.entity.ts

```ts
@Entity({ name: 'comment' })
export class Comment {
  @PrimaryGeneratedColumn('increment')
  uid: number;

  @Column({ type: 'varchar', length: 50 })
  content: string;

  @JoinColumn({ name: 'board_uid' })
  @ManyToOne(() => Board, (board) => board.comments)
  board: Board;
}
```

`@JoinColumn` 데코레이터로 forign key 컬럼명 명시<br />
`@ManyToOne` 데코레이터로 board 테이블과의 관계 명시

### 3. Service And Controller

#### 3.1. board.service.ts

```ts
@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
  ) {}

  async getAll(): Promise<Board[]> {
    return this.boardRepository.find();
  }

  async getOne(uid: number): Promise<Board> {
    const board = await this.boardRepository.findOne({ where: { uid } });
    if (!board) {
      throw new NotFoundException(`Board with uid ${uid} not found.`);
    }
    return board;
  }
}
```

`@InjectRepository` 데코레이터로 Board Entity의 Repository 주입

#### 3.2. board.controller.ts

```ts
@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  getAll(): Promise<Board[]> {
    return this.boardService.getAll();
  }

  @Get(':uid')
  getOne(@Param('uid') uid: number): Promise<Board> {
    return this.boardService.getOne(uid);
  }
}
```

### 4. Module

#### 4.1. board.module.ts

```ts
@Module({
  imports: [TypeOrmModule.forFeature([Board])],
  controllers: [BoardController],
  providers: [BoardService],
})
```

`TypeOrmModule.forFeature()` 메소드로 Repository 생성

#### 4.2. app.module.ts

```ts
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
```

`ConfigModule.forRoot()` 메소드로 .env 환경 변수 파일 주입
`TypeOrmModule.forRoot()` 메소드로 DataSource 설정

#### 5.3. main.ts

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  new ValidationPipe({
    whitelist: true, // Decorator가 존재하지 않는 프로퍼티를 허용하지 않음
    forbidNonWhitelisted: true, // 허용하지 않은 프로퍼티를 사용한 리퀘스트를 차단
    transform: true, // 유저가 보낸 값의 타입을 자동 변환
  });
  await app.listen(3000);
}
bootstrap();
```

### 6. Test

코드 작성은 끝났으니 테스트를 해보자

```bash
$ nest start --watch
```

#### 6.1. GET http://localhost:3000/board

```json
[
  {
    "uid": 1,
    "title": "제목",
    "content": "내용",
    "comments": [
      {
        "uid": 2,
        "content": "댓글2"
      },
      {
        "uid": 1,
        "content": "댓글1"
      }
    ]
  }
]
```

[1.2]에서 입력한 데이터가 정상적으로 JSON 형태로 반환되었다. :)

#### 6.2. GET http://localhost:3000/board/1

```json
{
  "uid": 1,
  "title": "제목",
  "content": "내용",
  "comments": [ ... ]
}
```

[1.2]에서 입력한 데이터가 정상적으로 JSON 형태로 반환되었다. :)

#### 6.3. GET http://localhost:3000/board/2

```json
{
  "statusCode": 404,
  "message": "Board with uid 2 not found.",
  "error": "Not Found"
}
```

해당하는 데이터가 존재하지 않으면 BoardService에서 NotFoundException을 throw한다.
