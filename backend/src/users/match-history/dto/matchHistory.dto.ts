import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class MatchHistoryDTO {
  @ApiProperty({ description: 'Player 1 id' })
  @IsString()
  player1: string;

  @ApiProperty({ description: 'Player 2 id' })
  @IsString()
  player2: string;

  @ApiProperty({ description: 'Player 1 점수 ' })
  @IsNumber()
  player1_score: number;

  @ApiProperty({ description: 'Player 2 점수 ' })
  @IsNumber()
  player2_score: number;

  @ApiProperty({ description: '매치 종류(초대 게임: false, 랜덤 게임: true)' })
  @IsBoolean()
  game_type: boolean;
}

export default MatchHistoryDTO;
