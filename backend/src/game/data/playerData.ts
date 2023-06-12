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