import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('match_history')
export class MatchHistory {
  @PrimaryGeneratedColumn()
  id: string;

  @ApiProperty({ description: 'Player 1 id' })
  @Column()
  player1: string;

  @ApiProperty({ description: 'Player 2 id' })
  @Column()
  player2: string;

  @ApiProperty({ description: 'Player 1 점수 ' })
  @Column()
  player1_score: number;

  @ApiProperty({ description: 'Player 2 점수 ' })
  @Column()
  player2_score: number;

  @ApiProperty({ description: '매치 종류(초대 게임: false, 랜덤 게임: ture)' })
  @Column()
  game_type: boolean;
}
