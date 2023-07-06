import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from '../entities/friend.entity';
import { FriendRequestStatus } from '../entities/friend.entity';
import { friendDTO } from './dto/friend.dto';
import { UsersService } from '../users.service';
import userDTO from '../user.dto';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    private readonly usersService: UsersService,
  ) {}

  // Find a friend request
  async findFriend(user_to: string): Promise<friendDTO[]> {
    const friendEntities: Friend[] = await this.friendRepository.find({
      where: {
        user_to: { id: user_to },
        // friend_status: In([FriendRequestStatus.PENDING, FriendRequestStatus.ACCEPTED]),
      },
    });
    // console.log(friendEntities);

    const ret: friendDTO[] = await Promise.all(
      friendEntities.map(async (friend) => {
        return {
          id: friend.user_from.id,
          nickname: friend.user_from.nickname,
          avatar: friend.user_from.avatar,
          status: friend.user_from.user_status,
          friendStatus: friend.friend_status,
        };
      }),
    );

    return ret;
  }

  async findOneFriend(user_from: string, user_to: string): Promise<friendDTO> {
    const friend: Friend = await this.friendRepository.findOne({
      where: {
        user_from: { id: user_from },
        user_to: { id: user_to },
      },
    });

    let friend_status: FriendRequestStatus;

    if (friend) {
      friend_status = friend.friend_status;
    } else friend_status = FriendRequestStatus.NOTHING;

    const userTo: userDTO = await this.usersService.findOne(user_to);

    const ret: friendDTO = {
      id: user_to,
      nickname: userTo.nickname,
      avatar: userTo.avatar,
      status: userTo.user_status,
      friendStatus: friend_status,
    };

    return ret;
  }

  // Send a friend request
  async sendFriendRequest(
    user_from: string,
    user_to: string,
  ): Promise<boolean> {
    // Check if user_from is blocked by user_to
    const blocked = await this.friendRepository.findOne({
      where: {
        user_from: { id: user_to },
        user_to: { id: user_from },
        friend_status: FriendRequestStatus.BLOCKED,
      },
    });

    if (blocked) {
      throw new ForbiddenException('You are blocked by this user');
    }

    const friendRequest: Friend = this.friendRepository.create({
      user_from: { id: user_from },
      user_to: { id: user_to },
    });
    this.friendRepository.save(friendRequest);
    return true;
  }

  // Accept a friend request
  async acceptFriendRequest(
    user_to: string,
    user_from: string,
  ): Promise<boolean> {
    const request = await this.friendRepository.findOne({
      where: {
        user_to: { id: user_to },
        user_from: { id: user_from },
      },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }
    if (request.friend_status !== FriendRequestStatus.PENDING) {
      throw new BadRequestException('Friend request is not pending');
    }

    // user_to accept
    request.friend_status = FriendRequestStatus.ACCEPTED;
    await this.friendRepository.save(request);

    // user_from create
    const friendship: Friend = this.friendRepository.create({
      user_from: { id: user_to },
      user_to: { id: user_from },
      friend_status: FriendRequestStatus.ACCEPTED,
    });
    await this.friendRepository.save(friendship);

    return true;
  }

  async deleteFriend(user_from: string, user_to: string): Promise<boolean> {
    // Fetch the friend entities from the database

    const friendEntities: Friend[] = await this.friendRepository.find({
      where: [
        { user_from: { id: user_to }, user_to: { id: user_from } },
        { user_from: { id: user_from }, user_to: { id: user_to } },
      ],
    });

    // If no entities are found, throw an error
    if (friendEntities.length < 1) {
      throw new NotFoundException(
        `Complete friend relationship between users ${user_from} and ${user_to} not found`,
      );
    }

    // If found, remove(delete) the entities from the database
    await this.friendRepository.delete(friendEntities[0]);
    if (friendEntities.length > 1)
      await this.friendRepository.delete(friendEntities[1]);

    return true;
  }

  // Block a user
  async blockUser(user_from: string, user_to: string): Promise<boolean> {
    const blocked: Friend = await this.friendRepository.findOne({
      where: {
        user_from: { id: user_to },
        user_to: { id: user_from },
        friend_status: FriendRequestStatus.BLOCKED,
      },
    });

    if (blocked) {
      throw new ForbiddenException('You are blocked by this user');
    }

    const blockship: Friend = this.friendRepository.create({
      user_from: { id: user_from },
      user_to: { id: user_to },
      friend_status: FriendRequestStatus.BLOCKED,
    });
    await this.friendRepository.save(blockship);

    return true;
  }
}
