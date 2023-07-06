import { Injectable } from '@nestjs/common';
import MatchHistoryDTO from './dto/matchHistory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MatchHistory } from '../entities/matchHistory.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users.service';
import userDTO from '../user.dto';

@Injectable()
export class MatchHistoryService {
  constructor(
    @InjectRepository(MatchHistory)
    private matchHistoryRepository: Repository<MatchHistory>,
    private readonly userService: UsersService,
  ) {}

  async findMatchHistory(id: string): Promise<MatchHistoryDTO[]> {
    const recentMatchHistory: MatchHistoryDTO[] =
      await this.matchHistoryRepository.find({
        where: [{ player1: id }, { player2: id }],
        order: { id: 'DESC' },
        take: 5,
      });
    return recentMatchHistory;
  }

  async saveMatchHistory(matchHistory: MatchHistoryDTO): Promise<boolean> {
    await this.matchHistoryRepository.save(matchHistory);

    const user1: userDTO = await this.userService.findOne(matchHistory.player1);
    const user2: userDTO = await this.userService.findOne(matchHistory.player2);

    if (matchHistory.player1_score > matchHistory.player2_score) {
      user1.win++;
      user2.lose++;
    } else {
      user2.win++;
      user1.lose++;
    }

    this.userService.updateUser(user1.id, user1);
    this.userService.updateUser(user2.id, user2);

    return true;
  }
}
