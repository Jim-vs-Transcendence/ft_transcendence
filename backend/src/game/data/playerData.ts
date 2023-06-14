import { GameInitData } from "../dto/gameData.dto";

export class Room {
    endTimer: any;
    dataFrame: any;

    leftPlayer: GameInitData;
    rightPlayer: GameInitData;

    isEnd: boolean;
    leftReady: boolean;
    rightReady: boolean;
}

export class GameRoom {
	_roomName: string;

	_canvasColor: string;

	// Ball Location
	_ballRadius: number;
	_gameScore: number;
}
