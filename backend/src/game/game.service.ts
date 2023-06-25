import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GameGateway } from './game.gateway';
import { GameRoom, GameClientOption } from './data/playerData';
import { GamePlayerData, GameUpdateData, GameMoveData, GamePlayerScoreData } from './dto/gameData.dto';

@Injectable()
export class GameService {
	private myGameGateway: GameGateway;

	constructor(
		gameGateway: GameGateway
	) { this.myGameGateway = gameGateway }

	private readonly fps: number = 1000 / 30;
	private readonly canvasWidth: number = 1000;
	private readonly canvasHeight: number = 500;

	private readonly initBallX: number = this.canvasWidth / 2;
	private readonly initBallY: number = this.canvasHeight / 2;
	// 옵션 페이지 매개변수로 받아서 설정해줄 것
	private readonly ballSpeed: number = 15;

	private readonly paddleWidth: number = this.canvasWidth * 0.02;
	private readonly paddleHeight: number = this.canvasHeight * 0.2;
	private readonly paddleMargin: number = this.canvasWidth * 0.05;

	private readonly initLeftPaddleX: number = this.paddleMargin;
	private readonly initRightPaddleX: number = this.canvasWidth - (this.paddleWidth + this.paddleMargin);
	private readonly initPaddleY: number = this.canvasHeight / 2 - this.paddleHeight / 2;



	async initPlayer(player: GamePlayerData, client: Socket) {
		player.socketId = client.id;
		player.isInGame = false;
		const userId: string | string[] = client.handshake.query._userId;
		if (userId !== null && typeof userId === 'string') {
			player.myId = userId;
		}

		player.canvasWidth = this.canvasWidth;
		player.canvasHeight = this.canvasHeight;

		player.paddleWidth = this.paddleWidth;
		player.paddleHeight = this.paddleHeight;
		player.leftPaddleX = this.initLeftPaddleX;
		player.rightPaddleX = this.initRightPaddleX;

		player.updateData.moveData.leftPaddleY = this.initPaddleY;
		player.updateData.moveData.rightPaddleY = this.initPaddleY;

		player.updateData.moveData.ballX = this.initBallX;
		player.updateData.moveData.ballY = this.initBallY;
		player.ballSpeed = this.ballSpeed;

		this.resetScore(player.updateData);
	}

	public setOption(room: GameRoom, gameClientOption: GameClientOption) {
		room.leftPlayer.gameScore = gameClientOption._gameScore;
		room.rightPlayer.gameScore = gameClientOption._gameScore;
		room.leftPlayer.canvasColor = gameClientOption._canvasColor;
		room.rightPlayer.canvasColor = gameClientOption._canvasColor;
		room.leftPlayer.ballRadius = gameClientOption._ballRadius;
		room.rightPlayer.ballRadius = gameClientOption._ballRadius;
		room.leftPlayer.isInGame = true;
		room.rightPlayer.isInGame = true;
	}

	private setBallMove(player1: GameMoveData, player2: GameMoveData): void {
		let moveX = (Math.random() < 0.5);
		let moveY = (Math.random() < 0.5);

		player1.ballMoveX = moveX;
		player2.ballMoveX = !moveX;
		player1.ballMoveY = moveY;
		player2.ballMoveY = moveY;
	}

	// test function will be call back to main page
	// 서비스로 가는데, 지우는 건 gateway가 해줘야 됨
	public endGame(room: GameRoom) {
		// 재시작 여부 판단 로직 추가
		console.log('who is it?', room.leftPlayer.socketId, room.rightPlayer.socketId);
		this.myGameGateway.server.to(room.leftPlayer.socketId).emit('gotoMain', true);
		this.myGameGateway.server.to(room.rightPlayer.socketId).emit('gotoMain', true);
		this.myGameGateway.roomKey.delete(room.leftPlayer.socketId);
		this.myGameGateway.roomKey.delete(room.rightPlayer.socketId);
		this.myGameGateway.rooms.delete(room.leftPlayer.socketId);
		console.log('wait success');
	}

	private resetScore(player: GameUpdateData) {
		player.leftScore = 0;
		player.rightScore = 0;
	}

	private resetPlayer(player: GameMoveData): void {
		player.ballX = this.initBallX;
		player.ballY = this.initBallY;
		player.leftPaddleY = this.initPaddleY;
		player.rightPaddleY = this.initPaddleY;
	}

	public resetGame(room: GameRoom): void {
		console.log('reset Game called');
		room.rightPlayer.updateData.leftScore = room.leftPlayer.updateData.rightScore;
		room.rightPlayer.updateData.rightScore = room.leftPlayer.updateData.leftScore;

		this.myGameGateway.server.to(room.leftPlayer.socketId).emit('oneSetEnd', room.leftPlayer.updateData);
		this.myGameGateway.server.to(room.rightPlayer.socketId).emit('oneSetEnd', room.rightPlayer.updateData);

		const endScore: number = room.leftPlayer.gameScore;

		if (room.leftPlayer.updateData.leftScore >= endScore || room.leftPlayer.updateData.rightScore >= endScore) {
			console.log('reset game called and game end');
			clearInterval(room.dataFrame);
			room.isEnd = true;
			room.leftReady = false;
			room.rightReady = false;

			// 시간초가 지나면 메인 페이지 이동, 시간초 보다 restart가 빠르면 재시작
			room.endTimer = setTimeout(() => this.endGame(room), 10000);

			
			if (room.leftPlayer.updateData.leftScore >= endScore) {
				this.myGameGateway.server.to(room.leftPlayer.socketId).emit('gameEnd', true);
				this.myGameGateway.server.to(room.rightPlayer.socketId).emit('gameEnd', false);
				
			}
			else {
				this.myGameGateway.server.to(room.leftPlayer.socketId).emit('gameEnd', false);
				this.myGameGateway.server.to(room.rightPlayer.socketId).emit('gameEnd', true);
			}
			const gamePlayerScoreData: GamePlayerScoreData = new GamePlayerScoreData();
			gamePlayerScoreData.player1 = room.leftPlayer.myId;
			gamePlayerScoreData.player1_score = room.leftPlayer.gameScore;
			gamePlayerScoreData.player2 = room.rightPlayer.myId;
			gamePlayerScoreData.player2_score = room.rightPlayer.gameScore;
			gamePlayerScoreData.game_type = room.gameType;
			// user 쪽에서 DB에 POST하는 로직 추가
			this.myGameGateway.matchHistoryService.saveMatchHistory(gamePlayerScoreData);
		}

		this.resetPlayer(room.leftPlayer.updateData.moveData);
		this.resetPlayer(room.rightPlayer.updateData.moveData);
		this.setBallMove(room.leftPlayer.updateData.moveData, room.rightPlayer.updateData.moveData);
	}

	private async gamePlay(room: GameRoom) {
		await this.sendGameData.bind(this)(room);
	}

	public sendGameData(room: GameRoom) {
		if (room.leftPlayer.updateData.moveData.ballX <= 0) {
			room.leftPlayer.updateData.rightScore++;
			this.resetGame(room);

		}
		if (room.leftPlayer.updateData.moveData.ballX >= this.canvasWidth - room.leftPlayer.ballRadius) {
			room.leftPlayer.updateData.leftScore++;
			this.resetGame(room);
		}
		if (!room.isEnd) {
			if (room.leftPlayer.updateData.moveData.ballY <= room.leftPlayer.ballRadius) {
				room.leftPlayer.updateData.moveData.ballMoveY = false;
				room.rightPlayer.updateData.moveData.ballMoveY = false;
			}
			if (room.leftPlayer.updateData.moveData.ballY >= this.canvasHeight - room.leftPlayer.ballRadius) {
				room.leftPlayer.updateData.moveData.ballMoveY = true;
				room.rightPlayer.updateData.moveData.ballMoveY = true;
			}

			if (room.leftPlayer.updateData.moveData.ballMoveY === true) {
				room.leftPlayer.updateData.moveData.ballY -= room.leftPlayer.ballSpeed;
				room.rightPlayer.updateData.moveData.ballY -= room.leftPlayer.ballSpeed;
			}
			else if (room.leftPlayer.updateData.moveData.ballMoveY === false) {
				room.leftPlayer.updateData.moveData.ballY += room.leftPlayer.ballSpeed;
				room.rightPlayer.updateData.moveData.ballY += room.leftPlayer.ballSpeed;
			}
			if (room.leftPlayer.updateData.moveData.ballMoveX === true) {
				room.leftPlayer.updateData.moveData.ballX -= room.leftPlayer.ballSpeed;
				room.rightPlayer.updateData.moveData.ballX += room.leftPlayer.ballSpeed;
			}
			else if (room.leftPlayer.updateData.moveData.ballMoveX === false) {
				room.leftPlayer.updateData.moveData.ballX += room.leftPlayer.ballSpeed;
				room.rightPlayer.updateData.moveData.ballX -= room.leftPlayer.ballSpeed;
			}

			if (room.leftPlayer.updateData.moveData.ballX - (room.leftPlayer.ballRadius) <= this.initLeftPaddleX + this.paddleWidth && room.leftPlayer.updateData.moveData.ballX - room.leftPlayer.ballRadius >= this.initLeftPaddleX) {
				if (room.leftPlayer.updateData.moveData.ballY <= room.leftPlayer.updateData.moveData.leftPaddleY + this.paddleHeight && room.leftPlayer.updateData.moveData.ballY >= room.leftPlayer.updateData.moveData.leftPaddleY) {
					room.leftPlayer.updateData.moveData.ballX = this.initLeftPaddleX + this.paddleWidth + room.leftPlayer.ballRadius;
					room.leftPlayer.updateData.moveData.ballMoveX = false;
					room.rightPlayer.updateData.moveData.ballX = this.initRightPaddleX - room.leftPlayer.ballRadius;
					room.rightPlayer.updateData.moveData.ballMoveX = true;

				}
			}

			if (room.leftPlayer.updateData.moveData.ballX + (room.leftPlayer.ballRadius) >= this.initRightPaddleX && room.leftPlayer.updateData.moveData.ballX + room.leftPlayer.ballRadius <= this.initRightPaddleX + this.paddleWidth) {
				if (room.leftPlayer.updateData.moveData.ballY <= room.leftPlayer.updateData.moveData.rightPaddleY + this.paddleHeight && room.leftPlayer.updateData.moveData.ballY >= room.leftPlayer.updateData.moveData.rightPaddleY) {
					room.leftPlayer.updateData.moveData.ballX = this.initRightPaddleX - room.leftPlayer.ballRadius;
					room.leftPlayer.updateData.moveData.ballMoveX = true;
					room.rightPlayer.updateData.moveData.ballX = this.initLeftPaddleX + this.paddleWidth + room.leftPlayer.ballRadius;
					room.rightPlayer.updateData.moveData.ballMoveX = false;
				}
			}
			this.myGameGateway.server.to(room.leftPlayer.socketId).emit('ballMove', room.leftPlayer.updateData.moveData);
			this.myGameGateway.server.to(room.rightPlayer.socketId).emit('ballMove', room.rightPlayer.updateData.moveData);
		}
	}

	// Option 창에서 시작 버튼 누를 때 ready
	public optionReady(room: GameRoom, clientId: string) {
		if (room.leftPlayer && clientId === room.leftPlayer.socketId) {
			room.leftReady = true;
		}
		else if (room.rightPlayer && clientId === room.rightPlayer.socketId) {
			room.rightReady = true;
		}
		if (room.leftReady && room.rightReady) {
			this.myGameGateway.server.to(room.leftPlayer.socketId).emit('optionReady', true);
			this.myGameGateway.server.to(room.rightPlayer.socketId).emit('optionReady', true);
			room.leftReady = false
			room.rightReady = false;
		}
	}

	// 실제 게임 화면에 넘어갔을 때 Enter클릭
	public getReady(room: GameRoom, clientId: string) {
		if (room.leftPlayer && clientId === room.leftPlayer.socketId) {
			room.leftReady = true;
		}
		else if (room.rightPlayer && clientId === room.rightPlayer.socketId) {
			room.rightReady = true;
		}
		if (room.leftReady && room.rightReady) {
			// game start
			this.resetScore(room.leftPlayer.updateData);
			this.resetScore(room.rightPlayer.updateData);
			this.setBallMove(room.leftPlayer.updateData.moveData, room.rightPlayer.updateData.moveData);
			room.isEnd = false;
			room.dataFrame = setInterval(() => this.gamePlay(room), this.fps);
		}
	}


	// gameUpdateData를 보낸다
	public paddleUp(room: GameRoom, clientId: string) {
		if (room.leftPlayer && clientId === room.leftPlayer.socketId) {
			room.leftPlayer.updateData.moveData.leftPaddleY -= 30;
			if (room.leftPlayer.updateData.moveData.leftPaddleY <= 0)
				room.leftPlayer.updateData.moveData.leftPaddleY = 0;
			room.rightPlayer.updateData.moveData.rightPaddleY = room.leftPlayer.updateData.moveData.leftPaddleY;
		}
		else if (room.rightPlayer && clientId === room.rightPlayer.socketId) {
			room.rightPlayer.updateData.moveData.leftPaddleY -= 30;
			if (room.rightPlayer.updateData.moveData.leftPaddleY <= 0)
				room.rightPlayer.updateData.moveData.leftPaddleY = 0;
			room.leftPlayer.updateData.moveData.rightPaddleY = room.rightPlayer.updateData.moveData.leftPaddleY;
		}
	}

	public paddleDown(room: GameRoom, clientId: string) {
		if (room.leftPlayer && clientId === room.leftPlayer.socketId) {
			room.leftPlayer.updateData.moveData.leftPaddleY += 30;
			if (room.leftPlayer.updateData.moveData.leftPaddleY >= this.canvasHeight - this.paddleHeight)
				room.leftPlayer.updateData.moveData.leftPaddleY = this.canvasHeight - this.paddleHeight;
			room.rightPlayer.updateData.moveData.rightPaddleY = room.leftPlayer.updateData.moveData.leftPaddleY;
		}
		else if (room.rightPlayer && clientId === room.rightPlayer.socketId) {
			room.rightPlayer.updateData.moveData.leftPaddleY += 30;
			if (room.rightPlayer.updateData.moveData.leftPaddleY >= this.canvasHeight - this.paddleHeight)
				room.rightPlayer.updateData.moveData.leftPaddleY = this.canvasHeight - this.paddleHeight;
			room.leftPlayer.updateData.moveData.rightPaddleY = room.rightPlayer.updateData.moveData.leftPaddleY;
		}
	}
}
