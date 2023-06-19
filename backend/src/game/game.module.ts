import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';

import { join } from 'path';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    UsersModule,
  ],
  controllers: [
    GameController,
  ],
  providers: [
    GameService,
    GameGateway
  ],
})
export class GameModule { }
