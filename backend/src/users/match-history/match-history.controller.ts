import { Controller, Get, Param } from '@nestjs/common';
import MatchHistoryDTO from './dto/matchHistory.dto';
import { MatchHistoryService } from './match-history.service';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('match-history')
@ApiTags('매치 히스토리 API')
export class MatchHistoryController {
  constructor(private readonly matchHistoryService: MatchHistoryService) {}

  @ApiOperation({
    summary: '매치 히스토리 조회 API',
    description: '최근 5개의 전적을 조회해줍니다.',
  })
  @ApiCreatedResponse({
    description:
      '최근 전적 5개를 Promise<MatchHistoryDTO[]> 형태로 반환해줍니다',
    type: Promise<MatchHistoryDTO[]>,
  })
  @Get(':id')
  async findMatchHistory(@Param('id') id: string): Promise<MatchHistoryDTO[]> {
    return await this.matchHistoryService.findMatchHistory(id);
  }
}
