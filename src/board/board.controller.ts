import { Controller, Get, Param } from '@nestjs/common';
import { Board } from './board.entity';
import { BoardService } from './board.service';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get()
  getAll(): Promise<Board[]> {
    return this.boardService.getAll();
  }

  @Get(':uid')
  getOne(@Param('uid') uid: number): Promise<Board> {
    console.log(uid);
    return this.boardService.getOne(uid);
  }
}
