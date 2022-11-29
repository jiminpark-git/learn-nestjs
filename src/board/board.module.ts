import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { BoardController } from './board.controller';
import { boardProviders } from './board.providers';
import { BoardService } from './board.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BoardController],
  providers: [...boardProviders, BoardService],
})
export class BoardModule {}
