import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friend.service';
import RequestWithUser from 'src/auth/interfaces/RequestWithUserID.interface';
import SendFriendRequestDTO from './dto/sendFriendRequest.dto';
import friendDTO from './dto/friend.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenGuard } from 'src/auth/token/token.guard';

@Controller('friends')
@UseGuards(TokenGuard)
@ApiTags('친구 관련 API')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @ApiOperation({
    summary: '친구 목록 조회 API',
    description: '현재 친구 목록을 불러옵니다.(user_',
  })
  @ApiCreatedResponse({
    description: 'friendDTO 배열을 반환해줍니다.',
    type: Promise<friendDTO[]>,
  })
  @Get()
  findFriend(@Req() req: RequestWithUser): Promise<friendDTO[]> {
    return this.friendsService.findFriend(req.user);
  }

  @ApiOperation({
    summary: '1 대 1 친구 관계 조회 API',
    description:
      '파라미터로 넘겨준 친구와 요청을 보낸 사람의 친구 관계를 조회해줍니다.',
  })
  @ApiCreatedResponse({
    description: '해당 친구의 friendDTO를 반환해줍니다.',
    type: Promise<friendDTO>,
  })
  @Get(':user_to')
  findOneFriend(
    @Req() req: RequestWithUser,
    @Param('user_to') user_to: string,
  ): Promise<friendDTO> {
    return this.friendsService.findOneFriend(req.user, user_to);
  }

  // Send a friend request
  @ApiOperation({
    summary: '친구 요청 API',
    description: '친구 요청을 해줍니다.',
  })
  @ApiCreatedResponse({
    description: '성공여부를 boolean값으로 반환해줍니다.',
    type: Boolean,
  })
  @Post('requests')
  sendFriendRequest(
    @Req() req: RequestWithUser,
    @Body() dto: SendFriendRequestDTO,
  ): Promise<boolean> {
    return this.friendsService.sendFriendRequest(req.user, dto.user_to);
  }

  // Accept a friend request
  @ApiOperation({
    summary: '친구 요청 수락 API',
    description: '친구 요청을 수락해줍니다.',
  })
  @ApiCreatedResponse({
    description: '성공여부를 boolean값으로 반환해줍니다.',
    type: Boolean,
  })
  @Post('requests/:user_from/accept')
  acceptFriendRequest(
    @Req() req: RequestWithUser,
    @Param('user_from') user_from: string,
  ): Promise<boolean> {
    console.log('accept');
    return this.friendsService.acceptFriendRequest(req.user, user_from);
  }

  @ApiOperation({
    summary: '친구 삭제 API',
    description: '친구를 삭제합니다.',
  })
  @ApiCreatedResponse({
    description: '성공여부를 boolean값으로 반환해줍니다.',
    type: Boolean,
  })
  @Delete(':user_to')
  deleteFriend(
    @Req() req: RequestWithUser,
    @Param('user_to') user_to: string,
  ): Promise<boolean> {
    return this.friendsService.deleteFriend(req.user, user_to);
  }

  @ApiOperation({
    summary: '친구 요청 거절 API',
    description: '친구를 요청을 거절합니다.',
  })
  @ApiCreatedResponse({
    description: '성공여부를 boolean값으로 반환해줍니다.',
    type: Boolean,
  })
  @Delete('requests/:user_from')
  rejectFriendRequest(
    @Req() req: RequestWithUser,
    @Param('user_from') user_from: string,
  ): Promise<boolean> {
    console.log('reject');
    return this.friendsService.deleteFriend(user_from, req.user);
  }

  // Block a user
  @ApiOperation({
    summary: '유저 block API',
    description: 'user_to에 해당하는 유저를 block 합니다.',
  })
  @ApiCreatedResponse({
    description: '성공여부를 boolean값으로 반환해줍니다.',
    type: Boolean,
  })
  @Post('blocks/:user_to')
  blockUser(
    @Req() req: RequestWithUser,
    @Param('user_to') user_to: string,
  ): Promise<boolean> {
    return this.friendsService.blockUser(req.user, user_to);
  }

  // Unblock a user
  @ApiOperation({
    summary: '유저 block 해제 API',
    description: 'user_to에 해당하는 유저의 block을 해제합니다.',
  })
  @ApiCreatedResponse({
    description: '성공여부를 boolean값으로 반환해줍니다.',
    type: Boolean,
  })
  @Delete('unblocks/:user_to')
  unblockUser(
    @Req() req: RequestWithUser,
    @Param('user_to') user_to: string,
  ): Promise<boolean> {
    return this.friendsService.unBlockUser(req.user, user_to);
  }
}
