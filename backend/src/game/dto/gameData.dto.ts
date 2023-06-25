import { Socket } from 'socket.io';

export class GameMoveData {
	ballX: number;
	ballY: number;
	ballMoveX: boolean;
	ballMoveY: boolean;

	leftPaddleY: number;
	rightPaddleY: number;
}

export class GameUpdateData {
	leftScore: number;
	rightScore: number;
	moveData: GameMoveData;
}

export class GamePlayerData {
	socketId: string;

	myId: string;
	urId: string;
	isInGame: boolean;

	canvasWidth: number;
	canvasHeight: number;
	canvasColor: string;

	gameScore: number = 3;

	paddleWidth: number;
	paddleHeight: number;
	leftPaddleX: number;
	rightPaddleX: number;

	updateData: GameUpdateData;
	ballRadius: number;
	ballSpeed: number;
}

export class GamePlayerScoreData {
	player1: string;
	player2: string;
	player1_score: number;
	player2_score: number;
	game_type: boolean;
}

export class GameInvitation {
	opponentPlayer: string;
	acceptFlag: boolean;
}
