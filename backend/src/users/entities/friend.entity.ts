import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum FriendRequestStatus {
  BLOCKED = 'blocked',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  NOTHING = 'nothing',
}

@Entity('friend')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty({ description: '인트라 내부 id1' })
  user_from: User;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty({ description: '인트라 내부 id2' })
  user_to: User;

  @Column({
    type: 'enum',
    enum: FriendRequestStatus,
    default: FriendRequestStatus.PENDING,
  })
  @ApiProperty({
    description:
      '친구 상태 (blocked: block, pending: 친구신청, accepted: 친구)',
  })
  friend_status: FriendRequestStatus;
}
