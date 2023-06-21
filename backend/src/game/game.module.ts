import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';

import { join } from 'path';
import { UsersModule } from 'src/users/users.module';
import { MatchHistoryModule } from 'src/users/match-history/match-history.module';

@Module({
  imports: [
    UsersModule,
    MatchHistoryModule
  ],
  controllers: [
    GameController,
  ],
  providers: [
    GameService,
    GameGateway,
  ],
})
export class GameModule { }
