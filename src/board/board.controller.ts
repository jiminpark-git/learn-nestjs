import { Controller, Get } from '@nestjs/common';
import { Board } from './board.entity';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  getAll(): Promise<Board[]> {
    return this.boardService.findAll();
  }
}
