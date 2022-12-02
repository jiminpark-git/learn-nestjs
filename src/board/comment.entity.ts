import { Board } from 'src/board/board.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
