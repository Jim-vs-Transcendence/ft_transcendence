import { Module, forwardRef } from '@nestjs/common';
import { MatchHistoryService } from './match-history.service';
import { MatchHistoryController } from './match-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchHistory } from '../entities/matchHistory.entity';
import { UsersModule } from '../users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchHistory]),
    forwardRef(() => UsersModule),
  ],
  providers: [MatchHistoryService],
  controllers: [MatchHistoryController],
  exports: [MatchHistoryService],
})
export class MatchHistoryModule {}
