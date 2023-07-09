export interface GameClientOption {
	_roomName: string;

	_canvasColor: string;

	// Ball Location
	_ballRadius: number;
	_gameScore: number;
}

export interface GameMoveData {
	ballX: number;
	ballY: number;
	ballMoveX: boolean;
	ballMoveY: boolean;

	leftPaddleY: number;
	rightPaddleY: number;
}

export interface GameUpdateData {
	leftScore: number;
	rightScore: number;
	moveData: GameMoveData;
}

export interface GamePlayerData {
	socketId: string;

	myId: string;
	urId: string;
	isInGame: boolean;

	canvasWidth: number;
	canvasHeight: number;
	canvasColor: string;

	gameScore: number;

	paddleWidth: number;
	paddleHeight: number;
	leftPaddleX: number;
	rightPaddleX: number;

	updateData: GameUpdateData;
	ballRadius: number;
	ballSpeed: number;
}

export const gameClientOption : GameClientOption = {
	_roomName: '',
	_canvasColor: '',
	_ballRadius: 0,
	_gameScore: 0,
}

export interface GameInvitationData {
	opponentPlayer: string;
	acceptFlag: boolean;
}
