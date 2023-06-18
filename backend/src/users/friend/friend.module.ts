import { Module } from '@nestjs/common';
import { FriendsService } from './friend.service';
import { FriendsController } from './friend.controller';
import { Friend } from '../entities/friend.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users.module';
import { TokenModule } from 'src/auth/token/token.module';

@Module({
  imports: [TypeOrmModule.forFeature([Friend]), UsersModule, TokenModule],
  providers: [FriendsService],
  controllers: [FriendsController],
})
export class FriendModule {}
