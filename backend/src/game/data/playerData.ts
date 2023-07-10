import { GamePlayerData } from "../dto/gameData.dto";

export class GameRoom {
    endTimer: any;
    dataFrame: any;

    gameType: boolean;
    isHitPaddle: boolean = false;
    leftPlayer: GamePlayerData;
    rightPlayer: GamePlayerData;

    isEnd: boolean;
    leftReady: boolean;
    rightReady: boolean;
}

export class GameClientOption {
	_roomName: string;

	_canvasColor: string;

	_ballRadius: number;
	_gameScore: number;
}
