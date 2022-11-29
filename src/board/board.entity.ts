import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Board {
  @PrimaryColumn()
  uid: number;

  @Column({ length: 20 })
  title: string;

  @Column({ length: 100 })
  content: string;
}
