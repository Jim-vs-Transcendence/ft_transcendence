import { User } from '../../users/entities/user.entity'
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
	user: User;
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

export class GameInvitePlayers {
	left: Socket;
	right: Socket;
}
