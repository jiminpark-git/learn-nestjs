import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';

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
