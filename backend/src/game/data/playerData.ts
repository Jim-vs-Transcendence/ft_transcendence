import { GamePlayerData } from "../dto/gameData.dto";

export class GameRoom {
    endTimer: any;
    dataFrame: any;

    gameType: boolean;
    leftPlayer: GamePlayerData;
    rightPlayer: GamePlayerData;

    isEnd: boolean;
    leftReady: boolean;
    rightReady: boolean;
}

export class GameClientOption {
	_roomName: string;

	_canvasColor: string;

	// Ball Location
	_ballRadius: number;
	_gameScore: number;
}
