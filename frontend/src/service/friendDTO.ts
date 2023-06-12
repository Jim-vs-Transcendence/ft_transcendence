enum FriendRequestStatus {
    BLOCKED = 'blocked',
    PENDING = 'pending',
    ACCEPTED = 'accepted',
}

interface friendDTO {
  id: string;
  nickname: string;
  avatar: string;
  status: number;
  friendStatus: FriendRequestStatus;
}