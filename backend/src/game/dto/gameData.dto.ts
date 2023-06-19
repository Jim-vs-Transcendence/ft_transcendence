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
	userId: string;
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

export class GamePlayerScoreData {
	player1Id: string;
	player2Id: string;
	player1Score: number;
	player2Score: number;
}

export class GameInvitation {
	opponentPlayer: string;
	acceptFlag: boolean;
}
