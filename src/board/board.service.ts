import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Board } from './board.entity';

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
