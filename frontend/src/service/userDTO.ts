enum UserStatus {
    OFFLINE = 0,
    ONLINE,
    GAMING,
    CHATING,
}

interface UserDTO {
    id: string;
    nickname: string;
    avatar: string;
    email: string;
    level: number;
    win: number;
    lose: number;
    two_factor: boolean;
    user_status: number;
}
