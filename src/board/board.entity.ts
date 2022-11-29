import { Comment } from 'src/comment/comment.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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
