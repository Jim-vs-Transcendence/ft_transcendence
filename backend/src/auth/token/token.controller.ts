import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { UsersService } from 'src/users/users.service';
import { TokenGuard } from './token.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import userDTO from 'src/users/user.dto';
import RequestWithUser from '../interfaces/RequestWithUserID.interface';

@Controller('token')
@ApiTags('토큰 API')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
  ) {}

  // token이 유효할 때는 유저 정보를 반환해주고 유효하지 않은 토큰이 넘어오면 false

  @ApiOperation({
    summary: '토큰 유효성 검사 API',
    description: 'Header로 넘겨준 토큰의 유효성 검사를 해줍니다.',
  })
  @ApiResponse({
    description:
      '토큰이 유효하다면 해당 토큰의 소유주의 id를 반환해주고 유효하지 않다면 false(boolean)을 반환해줍니다.',
  })
  @Get()
  @UseGuards(TokenGuard)
  async verifyToken(@Req() req: RequestWithUser): Promise<boolean | userDTO> {
    if (!req.user) return false;

    // const test = req.cookies['authToken'];
    const user = await this.usersService.findOne(req.user);
    if (user.user_status === 0) {
      user.user_status = 1;
      this.usersService.updateUser(req.user, user);
    }
    return user;
  }

  @ApiOperation({
    summary: '토큰 획득 API',
    description: 'Parameter에 해당하는 유저의 토큰을 반환해줍니다.',
  })
  @ApiResponse({
    description: 'Parameter에 해당하는 유저의 토큰을 반환해줍니다.',
  })
  @Get(':id')
  async getToken(@Param('id') userId: string): Promise<string | undefined> {
    return await this.tokenService.getToken(userId);
  }
}
