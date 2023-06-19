import { Injectable } from '@nestjs/common';
import { GameGateway } from './game.gateway';
<<<<<<< HEAD
import { GameRoom, Room } from './data/playerData';
import { MoveData, GameInitData, GameUpdateData } from './dto/gameData.dto';

@Injectable()
export class GameService {
	private myGameGateway: GameGateway;

	constructor(
		gameGateway: GameGateway
	) { this.myGameGateway = gameGateway }

	private readonly fps: number = 1000 / 30;
	private readonly canvasWidth: number = 1200;
	private readonly canvasHeight: number = 600;

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

	public initPlayer(player: GameInitData, socketId: string) {
		player.socketId = socketId;

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

	public setOption(room: Room, Room: GameRoom) {
		room.leftPlayer.gameScore = Room._gameScore;
		room.rightPlayer.gameScore = Room._gameScore;
		room.leftPlayer.canvasColor = Room._canvasColor;
		room.rightPlayer.canvasColor = Room._canvasColor;
		room.leftPlayer.ballRadius = Room._ballRadius;
		room.rightPlayer.ballRadius = Room._ballRadius;
	}

	private setBallMove(player1: MoveData, player2: MoveData): void {
		let moveX = (Math.random() < 0.5);
		let moveY = (Math.random() < 0.5);

		player1.ballMoveX = moveX;
		player2.ballMoveX = !moveX;
		player1.ballMoveY = moveY;
		player2.ballMoveY = moveY;
	}

	// test function will be call back to main page
	// 서비스로 가는데, 지우는 건 gateway가 해줘야 됨
	public endGame(room: Room) {
		// 재시작 여부 판단 로직 추가
		this.myGameGateway.roomKey.delete(room.leftPlayer.socketId);
		this.myGameGateway.roomKey.delete(room.rightPlayer.socketId);
		this.myGameGateway.rooms.delete(room.leftPlayer.socketId);
		// goto()? 모름
		console.log('wait success');
	}

	// private updateMatchHistroy(player1: , player2: ) {
	// 	지금은 몰?루
	// }

	private resetScore(player: GameUpdateData) {
		player.leftScore = 0;
		player.rightScore = 0;
	}

	private resetPlayer(player: MoveData): void {
		player.ballX = this.initBallX;
		player.ballY = this.initBallY;
		player.leftPaddleY = this.initPaddleY;
		player.rightPaddleY = this.initPaddleY;
	}

	public resetGame(room: Room): void {
		room.rightPlayer.updateData.leftScore = room.leftPlayer.updateData.rightScore;
		room.rightPlayer.updateData.rightScore = room.leftPlayer.updateData.leftScore;

		this.myGameGateway.server.to(room.leftPlayer.socketId).emit('scoring', room.leftPlayer.updateData);
		this.myGameGateway.server.to(room.rightPlayer.socketId).emit('scoring', room.rightPlayer.updateData);

		if (room.leftPlayer.updateData.leftScore >= 3 || room.leftPlayer.updateData.rightScore >= 3) {
			clearInterval(room.dataFrame);
			room.isEnd = true;
			room.leftReady = false;
			room.rightReady = false;
			// 전적 갱신


			// 시간초가 지나면 메인 페이지 이동, 시간초 보다 restart가 빠르면 재시작
			room.endTimer = setTimeout(this.endGame, 10000, room);

			if (room.leftPlayer.updateData.leftScore >= 3) {
				this.myGameGateway.server.to(room.leftPlayer.socketId).emit('endGame', true);
				this.myGameGateway.server.to(room.rightPlayer.socketId).emit('endGame', false);
			}
			else {
				this.myGameGateway.server.to(room.leftPlayer.socketId).emit('endGame', false);
				this.myGameGateway.server.to(room.rightPlayer.socketId).emit('endGame', true);
			}
		}

		this.resetPlayer(room.leftPlayer.updateData.moveData);
		this.resetPlayer(room.rightPlayer.updateData.moveData);
		this.setBallMove(room.leftPlayer.updateData.moveData, room.rightPlayer.updateData.moveData);
	}

	private async gamePlay(room: Room) {
		await this.sendGameData.bind(this)(room);
	}

	public sendGameData(room: Room) {
		console.log('what the fuck with you?', room.leftPlayer.ballRadius);
		if (room.leftPlayer.updateData.moveData.ballX <= 0) {
			room.leftPlayer.updateData.rightScore++;
			this.resetGame(room);

		}
		if (room.leftPlayer.updateData.moveData.ballX >= this.canvasWidth - room.leftPlayer.ballRadius * 2) {
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

			if (room.leftPlayer.updateData.moveData.ballX - (room.leftPlayer.ballRadius * 2) <= this.initLeftPaddleX && room.leftPlayer.updateData.moveData.ballX >= this.initLeftPaddleX - this.paddleWidth) {
				if (room.leftPlayer.updateData.moveData.ballY <= room.leftPlayer.updateData.moveData.leftPaddleY + this.paddleHeight && room.leftPlayer.updateData.moveData.ballY >= room.leftPlayer.updateData.moveData.leftPaddleY) {
					room.leftPlayer.updateData.moveData.ballX = this.initLeftPaddleX + room.leftPlayer.ballRadius * 2;
					room.leftPlayer.updateData.moveData.ballMoveX = false;
					room.rightPlayer.updateData.moveData.ballX = this.initRightPaddleX - room.leftPlayer.ballRadius * 2;
					room.rightPlayer.updateData.moveData.ballMoveX = true;

				}
			}

			if (room.leftPlayer.updateData.moveData.ballX - (room.leftPlayer.ballRadius * 2) <= this.initRightPaddleX && room.leftPlayer.updateData.moveData.ballX >= this.initRightPaddleX - this.paddleWidth) {
				if (room.leftPlayer.updateData.moveData.ballY <= room.leftPlayer.updateData.moveData.rightPaddleY + this.paddleHeight && room.leftPlayer.updateData.moveData.ballY >= room.leftPlayer.updateData.moveData.rightPaddleY) {
					room.leftPlayer.updateData.moveData.ballX = this.initRightPaddleX - room.leftPlayer.ballRadius * 2;
					room.leftPlayer.updateData.moveData.ballMoveX = true;
					room.rightPlayer.updateData.moveData.ballX = this.initLeftPaddleX + room.leftPlayer.ballRadius * 2;
					room.rightPlayer.updateData.moveData.ballMoveX = false;
				}
			}
			console.log(room.leftPlayer);
			this.myGameGateway.server.to(room.leftPlayer.socketId).emit('ballMove', room.leftPlayer.updateData.moveData);
			this.myGameGateway.server.to(room.rightPlayer.socketId).emit('ballMove', room.rightPlayer.updateData.moveData);
		}
	}

	// Option 창에서 시작 버튼 누를 때 ready
	public optionReady(room: Room, clientId: string) {
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
	public getReady(room: Room, clientId: string) {
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
	public paddleUp(room: Room, clientId: string) {
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

	public paddleDown(room: Room, clientId: string) {
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
=======
import { Room } from './data/playerData';
import { gameDataDto } from './gameDto/gameData.dto';

@Injectable()
export class GameService {
    private myGameGateway: GameGateway;

    constructor(
        gameGateway: GameGateway
    ) { this.myGameGateway = gameGateway }

    private readonly fps: number = 1000 / 30;
    private readonly canvasWidth: number = 1200;
    private readonly canvasHeight: number = 600;
    private readonly canvasColor: string = 'black' /* |  param */;

    private readonly initBallX: number = this.canvasWidth / 2;
    private readonly initBallY: number = this.canvasHeight / 2;
    private readonly ballRadius: number = Math.min(this.canvasWidth * 0.02, this.canvasHeight * 0.02) /* * ballSize */;

    private readonly paddleWidth: number = this.canvasWidth * 0.02;
    private readonly paddleHeight: number = this.canvasHeight * 0.2;
    private readonly paddleMargin: number = this.canvasWidth * 0.05;

    private readonly initLeftPaddleX: number = this.paddleMargin;
    private readonly initRightPaddleX: number = this.canvasWidth - (this.paddleWidth + this.paddleMargin);
    private readonly initPaddleY: number = this.canvasHeight / 2 - this.paddleHeight / 2;

    public initPlayer(player: gameDataDto, socketId: string) {
        player.socketId = socketId;
        player.canvasWidth = this.canvasWidth;
        player.canvasHeight = this.canvasHeight;
        player.canvasColor = this.canvasColor;

        player.ballX = this.initBallX;
        player.ballY = this.initBallY;
        player.ballRadius = this.ballRadius;
        player.ballSpeed = 15;

        player.paddleWidth = this.paddleWidth;
        player.paddleHeight = this.paddleHeight;
        player.leftPaddleX = this.initLeftPaddleX;
        player.rightPaddleX = this.initRightPaddleX;
        player.leftPaddleY = this.initPaddleY;
        player.rightPaddleY = this.initPaddleY;

        player.leftScore = 0;
        player.rightScore = 0;
    }

    // test function will be call back to main page
    // 서비스로 가는데, 지우는 건 gateway가 해줘야 됨
    public test(room) {
        const idx: number = this.myGameGateway.rooms.indexOf(room);
        // 전적 추가
        // 재시작 여부 판단 로직 추가
        if (idx !== -1) {
            this.myGameGateway.rooms.splice(idx, 1);
        }
        console.log('wait success');
    }

    public resetGame(room: Room): void {
        room.rightPlayer.leftScore = room.leftPlayer.rightScore;
        room.rightPlayer.rightScore = room.leftPlayer.leftScore;
        if (room.leftPlayer.leftScore >= 3 || room.leftPlayer.rightScore >= 3) {
            clearInterval(room.dataFrame);
            room.isEnd = true;

            // 시간초가 지나면 메인 페이지 이동, 시간초 보다 restart가 빠르면 재시작
            room.endTimer = setTimeout(this.test, 10000, room);

            if (room.leftPlayer.leftScore >= 3) {
                this.myGameGateway.server.to(room.leftPlayer.socketId).emit('endGame', true);
                this.myGameGateway.server.to(room.rightPlayer.socketId).emit('endGame', false);
            }
            else {
                this.myGameGateway.server.to(room.leftPlayer.socketId).emit('endGame', false);
                this.myGameGateway.server.to(room.rightPlayer.socketId).emit('endGame', true);
            }

        }
        room.leftPlayer.ballX = this.initBallX;
        room.leftPlayer.ballY = this.initBallY;
        room.leftPlayer.leftPaddleY = this.initPaddleY;
        room.leftPlayer.rightPaddleY = this.initPaddleY;
        room.leftPlayer.ballMoveX = false;
        room.leftPlayer.ballMoveY = false;

        room.rightPlayer.ballX = this.initBallX;
        room.rightPlayer.ballY = this.initBallY;
        room.rightPlayer.leftPaddleY = this.initPaddleY;
        room.rightPlayer.rightPaddleY = this.initPaddleY;
        room.rightPlayer.ballMoveX = false;
        room.rightPlayer.ballMoveY = false;
    }

    private async gamePlay(room: Room) {
        await this.sendGameData.bind(this)(room);
    }

    public sendGameData(room: Room) {
        if (room.leftPlayer.ballX <= 0) {
            room.leftPlayer.rightScore++;
            this.resetGame(room);

        }
        if (room.leftPlayer.ballX >= this.canvasWidth - this.ballRadius * 2) {
            room.leftPlayer.leftScore++;
            this.resetGame(room);
        }
        if (!room.isEnd) {
            if (room.leftPlayer.ballY <= this.ballRadius) {
                room.leftPlayer.ballMoveY = false;
                room.rightPlayer.ballMoveY = false;
            }
            if (room.leftPlayer.ballY >= this.canvasHeight - this.ballRadius) {
                room.leftPlayer.ballMoveY = true;
                room.rightPlayer.ballMoveY = true;
            }

            if (room.leftPlayer.ballMoveY === true) {
                room.leftPlayer.ballY -= room.leftPlayer.ballSpeed;
                room.rightPlayer.ballY -= room.leftPlayer.ballSpeed;
            }
            else if (room.leftPlayer.ballMoveY === false) {
                room.leftPlayer.ballY += room.leftPlayer.ballSpeed;
                room.rightPlayer.ballY += room.leftPlayer.ballSpeed;
            }
            if (room.leftPlayer.ballMoveX === true) {
                room.leftPlayer.ballX -= room.leftPlayer.ballSpeed;
                room.rightPlayer.ballX += room.leftPlayer.ballSpeed;
            }
            else if (room.leftPlayer.ballMoveX === false) {
                room.leftPlayer.ballX += room.leftPlayer.ballSpeed;
                room.rightPlayer.ballX -= room.leftPlayer.ballSpeed;
            }

            if (room.leftPlayer.ballX - (this.ballRadius * 2) <= this.initLeftPaddleX && room.leftPlayer.ballX >= this.initLeftPaddleX - this.paddleWidth) {
                if (room.leftPlayer.ballY <= room.leftPlayer.leftPaddleY + this.paddleHeight && room.leftPlayer.ballY >= room.leftPlayer.leftPaddleY) {
                    room.leftPlayer.ballX = this.initLeftPaddleX + this.ballRadius * 2;
                    room.leftPlayer.ballMoveX = false;
                    room.rightPlayer.ballX = this.initRightPaddleX - this.ballRadius * 2;
                    room.rightPlayer.ballMoveX = true;

                }
            }

            if (room.leftPlayer.ballX - (this.ballRadius * 2) <= this.initRightPaddleX && room.leftPlayer.ballX >= this.initRightPaddleX - this.paddleWidth) {
                if (room.leftPlayer.ballY <= room.leftPlayer.rightPaddleY + this.paddleHeight && room.leftPlayer.ballY >= room.leftPlayer.rightPaddleY) {
                    room.leftPlayer.ballX = this.initRightPaddleX - this.ballRadius * 2;
                    room.leftPlayer.ballMoveX = true;
                    room.rightPlayer.ballX = this.initLeftPaddleX + this.ballRadius * 2;
                    room.rightPlayer.ballMoveX = false;
                }
            }
            console.log(room.leftPlayer);
            this.myGameGateway.server.to(room.leftPlayer.socketId).emit('ballMove', room.leftPlayer);
            this.myGameGateway.server.to(room.rightPlayer.socketId).emit('ballMove', room.rightPlayer);
        }
    }

    public getReady(room: Room, clientId: string) {
        if (room.leftPlayer && clientId === room.leftPlayer.socketId) {
            room.leftReady = true;
        }
        else if (room.rightPlayer && clientId === room.rightPlayer.socketId) {
            room.rightReady = true;
        }
        if (room.leftReady && room.rightReady) {
            // game start
            room.leftPlayer.ballMoveX = false;
            room.leftPlayer.ballMoveY = false;
            room.rightPlayer.ballMoveX = false;
            room.rightPlayer.ballMoveY = false;
            room.isEnd = false;
            room.dataFrame = setInterval(() => this.gamePlay(room), this.fps);
        }
    }


    public paddleUp(room: Room, clientId: string) {
        if (room.leftPlayer && clientId === room.leftPlayer.socketId) {
            room.leftPlayer.leftPaddleY -= 30;
            if (room.leftPlayer.leftPaddleY <= 0)
                room.leftPlayer.leftPaddleY = 0;
            room.rightPlayer.rightPaddleY = room.leftPlayer.leftPaddleY;
        }
        else if (room.rightPlayer && clientId === room.rightPlayer.socketId) {
            room.rightPlayer.leftPaddleY -= 30;
            if (room.rightPlayer.leftPaddleY <= 0)
                room.rightPlayer.leftPaddleY = 0;
            room.leftPlayer.rightPaddleY = room.rightPlayer.leftPaddleY;
        }
    }

    public paddleDown(room: Room, clientId: string) {
        if (room.leftPlayer && clientId === room.leftPlayer.socketId) {
            room.leftPlayer.leftPaddleY += 30;
            if (room.leftPlayer.leftPaddleY >= this.canvasHeight - this.paddleHeight)
                room.leftPlayer.leftPaddleY = this.canvasHeight - this.paddleHeight;
            room.rightPlayer.rightPaddleY = room.leftPlayer.leftPaddleY;
        }
        else if (room.rightPlayer && clientId === room.rightPlayer.socketId) {
            room.rightPlayer.leftPaddleY += 30;
            if (room.rightPlayer.leftPaddleY >= this.canvasHeight - this.paddleHeight)
                room.rightPlayer.leftPaddleY = this.canvasHeight - this.paddleHeight;
            room.leftPlayer.rightPaddleY = room.rightPlayer.leftPaddleY;
        }
    }
>>>>>>> 045c0a6502635c2d25f0642d86671f877cc9d979
}
