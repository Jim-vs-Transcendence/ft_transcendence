export class MoveData {
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
	moveData: MoveData;
}

export class GameInitData {
	socketId: string;
	playerName: string;

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
