<<<<<<< HEAD
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
=======
import { gameDataDto } from "../gameDto/gameData.dto";

export class Room {
    isEnd: boolean;
    endTimer: any;
    dataFrame: any;
    roomName: string;
    leftPlayer: gameDataDto;
    rightPlayer: gameDataDto;
    leftReady: boolean;
    rightReady: boolean;
}
>>>>>>> 045c0a6502635c2d25f0642d86671f877cc9d979
