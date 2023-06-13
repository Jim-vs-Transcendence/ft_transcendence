import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum FriendRequestStatus {
  BLOCKED = 'blocked',
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  NOTHING = 'nothing',
}

@Entity('friend')
export class Friend {
  @PrimaryColumn()
  @ApiProperty({ description: '인트라 내부 id1' })
  user_from: string;

  @PrimaryColumn()
  @ApiProperty({ description: '인트라 내부 id2' })
  user_to: string;

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
