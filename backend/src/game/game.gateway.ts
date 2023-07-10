import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, MessageBody, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket, Namespace } from 'socket.io';
import { GamePlayerData, GameUpdateData, GameMoveData, GamePlayerScoreData, GameInvitation } from './dto/gameData.dto';
import { GameRoom, GameClientOption } from './data/playerData';
import { GameService } from './game.service';
import { MatchHistoryService } from 'src/users/match-history/match-history.service';
import { UsersService } from 'src/users/users.service';
/*
 * service : gateway에서 호출되어 게임 내부 로직 변경 (현재 게이트웨이에 있는 private 함수들)
 * gateway : 클라이언트에서 받은 소켓 정보를 service 함수를 호출하여 핸들링
 *
 * 문제는 gateway에서 rooms 배열을 가지고 있는데, timeout 함수 호출 시 해당 room을 지워야 함.
 * 그러면 gateway에서 room을 찾아 지워주는 함수를 만들고, service에서 gateway함수를 호출하여 해당 room 삭제 되게
 * -> 서비스에서 constructor로 게이트웨이를 가지고 있으니까 해당 요소를 불러서 삭제하도록 하면 될 듯?
 */


@WebSocketGateway({ namespace: '/game', cors: true })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Namespace;

	private service: GameService;

	// rooms : 2명의 클라이언트가 들어있는 게임 룸
	public rooms = new Map<string, GameRoom>();

	// refresh될 때 disconnect된 방을 찾기 위한 자료구조
	// key 값이 socketId, value가 소속된 roomName
	public roomKey = new Map<string, string>();

	private gameUsers = new Map<string, Socket>();

	private players: GamePlayerData[];

	constructor(
		private readonly usersService: UsersService,
		public readonly matchHistoryService: MatchHistoryService,
		) {
		this.service = new GameService(this);
		this.rooms;
		this.players = [];
	}

	@SubscribeMessage('mainConnect')
	handleConnection(
		@ConnectedSocket() client: Socket,
	) {
		const userid: string | string[] = client.handshake.query._userId;
		if (typeof userid === 'string') {
			if (this.gameUsers.has(userid))
				this.gameUsers.get(userid).disconnect();
			this.gameUsers.set(userid, client);
		}
		client.emit('gameSocketCreation',);
	}

	afterInit(server: Server) {
		this.server.server.engine.opts.pingTimeout = 20000;
		this.server.server.engine.opts.pingInterval = 20000;
		this.server.server.engine.opts.upgradeTimeout = 20000;
	}

	private destroyRoom(client: Socket, gameStatus?: boolean) {
		const curPlayer: GamePlayerData = this.players.find(data => data.socketId === client.id);
		if (curPlayer) {
			const playerIndex: number = this.players.indexOf(curPlayer);
			this.players.splice(playerIndex, 1);
		}
		else {
			const destroyedRoom: string = this.roomKey.get(client.id);

			if (destroyedRoom) {
				const room: GameRoom = this.rooms.get(destroyedRoom);
				const gamePlayerScoreData: GamePlayerScoreData = new GamePlayerScoreData();
				clearInterval(room.dataFrame);
				clearInterval(room.endTimer);

				if (room.isEnd) {
					this.service.endGame(room);
					return ;
				}

				if (room.leftPlayer.socketId === client.id) {
					// rightPlayer win
					if (gameStatus === true) {
						gamePlayerScoreData.player1 = room.leftPlayer.myId;
						gamePlayerScoreData.player1_score = 0;
						gamePlayerScoreData.player2 = room.rightPlayer.myId;
						gamePlayerScoreData.player2_score = room.rightPlayer.gameScore;
						gamePlayerScoreData.game_type = room.gameType;

						this.matchHistoryService.saveMatchHistory(gamePlayerScoreData);
					}

					this.service.endGame(room);
				}
				else {
					// leftPlayer Win
					if (gameStatus === true) {
						gamePlayerScoreData.player1 = room.leftPlayer.myId;
						gamePlayerScoreData.player1_score = room.leftPlayer.gameScore;
						gamePlayerScoreData.player2 = room.rightPlayer.myId;
						gamePlayerScoreData.player2_score = 0;
						gamePlayerScoreData.game_type = room.gameType;

						this.matchHistoryService.saveMatchHistory(gamePlayerScoreData);
					}

					this.service.endGame(room);
				}
			}
		}
	}

	handleDisconnect(client: Socket) {
		this.destroyRoom(client, true);
	}

	public findRoom(roomName: string): GameRoom {
		let room: GameRoom = this.rooms.get(roomName);
		return room;
	}

	public findGameUserSocket(gameUser: string): Socket {
		let userSocket: Socket = this.gameUsers.get(gameUser);
		return userSocket;
	}

	@SubscribeMessage('pushMatchList')
	pushPlayer(
		@ConnectedSocket() client: Socket,
	) {
		let player: GamePlayerData = new GamePlayerData();
		player.updateData = new GameUpdateData();
		player.updateData.moveData = new GameMoveData();

		this.service.initPlayer(player, client);
		this.players.push(player);
		// userService에서 updateUserStatus를 사용해서 게임중(2)으로 변경
		this.usersService.updateUserStatus(player.myId, 2);

		if (this.players.length >= 2) {
			let room: GameRoom = new GameRoom();

			room.leftPlayer = this.players.shift();
			room.rightPlayer = this.players.shift();

			if (room.leftPlayer.socketId !== room.rightPlayer.socketId) {
				room.leftPlayer.urId = room.rightPlayer.myId;
				room.rightPlayer.urId = room.leftPlayer.myId;

				room.gameType = true;

				this.rooms.set(room.leftPlayer.socketId, room);

				this.roomKey.set(room.leftPlayer.socketId, room.leftPlayer.socketId);
				this.roomKey.set(room.rightPlayer.socketId, room.leftPlayer.socketId);

				this.server.to(room.leftPlayer.socketId).emit('roomName', room.leftPlayer.socketId);
				this.server.to(room.rightPlayer.socketId).emit('roomName', room.leftPlayer.socketId);
			}
			else {
				this.server.to(room.leftPlayer.socketId).emit('gotoMain', );
			}
		}
	}

	@SubscribeMessage('gameQuit')
	clientQuit(
		@ConnectedSocket() client: Socket,
		@MessageBody() gameStatus: boolean,
	) {
		this.destroyRoom(client, gameStatus);
	}

	@SubscribeMessage('queueOut')
	clientQueueOut(
		@ConnectedSocket() client: Socket,
	) {
		const curPlayer: GamePlayerData = this.players.find(data => data.socketId === client.id);
		if (curPlayer) {
			const playerIndex: number = this.players.indexOf(curPlayer);
			this.players.splice(playerIndex, 1);
		}
		client.emit('gotoMain', );
	}


	@SubscribeMessage('sendGameInvite')
	sendGameInvite(
		@ConnectedSocket() client: Socket,
		@MessageBody() opponentPlayer: string,
	) {
		let userSocket = this.findGameUserSocket(opponentPlayer);
		if (userSocket) {
			userSocket.emit('youGotInvite', client.handshake.query._userId);
		}
		else {
			client.emit('gotoMain');
		}
	}

	private handleInvitation(player1: Socket, player2: Socket) {
		let left: GamePlayerData = new GamePlayerData();
		left.updateData = new GameUpdateData();
		left.updateData.moveData = new GameMoveData();
		this.service.initPlayer(left, player1);

		let right: GamePlayerData = new GamePlayerData();
		right.updateData = new GameUpdateData();
		right.updateData.moveData = new GameMoveData();
		this.service.initPlayer(right, player2);

		let room: GameRoom = new GameRoom();

		room.gameType = false;
		room.leftPlayer = left;
		room.rightPlayer = right;

		room.leftPlayer.urId = room.rightPlayer.myId;
		room.rightPlayer.urId = room.leftPlayer.myId;

		this.rooms.set(room.leftPlayer.socketId, room);

		this.roomKey.set(room.leftPlayer.socketId, room.leftPlayer.socketId);
		this.roomKey.set(room.rightPlayer.socketId, room.leftPlayer.socketId);

		this.server.to(room.leftPlayer.socketId).emit('roomName', room.leftPlayer.socketId);
		this.server.to(room.rightPlayer.socketId).emit('roomName', room.leftPlayer.socketId);
	}

	@SubscribeMessage('inviteResponsse')
	gameInviteResponse(
		@ConnectedSocket() client: Socket,
		@MessageBody() gameInvitation: GameInvitation,
	) {
		let gameUser: Socket = this.findGameUserSocket(gameInvitation.opponentPlayer);
		const userId: string | string[] = client.handshake.query._userId;
		let realUserId: string;
		if (typeof userId === 'string' && userId !== null) {
			realUserId = userId;
		}
		if (gameInvitation.acceptFlag === true) {
			this.handleInvitation(client, gameUser);
			this.usersService.updateUserStatus(gameInvitation.opponentPlayer, 2);
			this.usersService.updateUserStatus(realUserId, 2);
		}
		else {
			gameUser.emit('InviteDenied');
		}
	}

	@SubscribeMessage('optionPageArrived')
	handleOptionPageStart(
		@ConnectedSocket() client: Socket,
	) {
		let gameRoom: string = this.roomKey.get(client.id);
		if (!gameRoom) {
			this.server.to(client.id).emit('gotoMain', );
		}
	}

	@SubscribeMessage('optionReady')
	handleOptionReady(
		@ConnectedSocket() client: Socket,
		@MessageBody() gameClientOption: GameClientOption,
	) {
		let room = this.findRoom(gameClientOption._roomName);
		if (room) {
			if (client.id === room.leftPlayer.socketId) {
				this.service.setOption(room, gameClientOption);
			}
			this.service.optionReady(room, client.id);
		}
		else {
			this.server.to(client.id).emit('gotoMain', );
		}
	}

	@SubscribeMessage('inGamePageArrived')
	handleGotoInGameHandler(
		@ConnectedSocket() client: Socket,
		@MessageBody() RoomName: string,
	) {
		let room = this.findRoom(RoomName);
		if (room) {
			if (RoomName === client.id) {
				this.server.to(client.id).emit('gameDraw', room.leftPlayer);
			}
			else {
				this.server.to(client.id).emit('gameDraw', room.rightPlayer);
			}
		}
		else {
			this.server.to(client.id).emit('gotoMain', );
		}
	}

	// Enter Key pressed : game ready
	@SubscribeMessage('gameReady')
	handleEnter(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomName: string,
	) {
		let room = this.findRoom(roomName);
		if (room) {
			this.service.getReady(room, client.id);
		}
		else {
		}
	}

	// Up Key pressed : Paddle up
	@SubscribeMessage('downKey')
	handlePaddleUp(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomName: string,
	) {
		let room = this.findRoom(roomName);
		if (room) {
			this.service.paddleDown(room, client.id);
		}
		else {
		}
	}

	// Down Key pressed : Paddle down
	@SubscribeMessage('upKey')
	handlePaddleDown(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomName: string,
	) {
		let room = this.findRoom(roomName);
		if (room) {
			this.service.paddleUp(room, client.id);
		}
	}

	@SubscribeMessage('gameRestart')
	waitTester(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomName: string,
	) {

		let room = this.findRoom(roomName);
		if (room) {
			if (client.id === room.leftPlayer.socketId) {
				room.leftReady = true;
			}
			else {
				room.rightReady = true;
			}
			if (room.leftReady && room.rightReady) {
				clearTimeout(room.endTimer);
				this.server.to(room.leftPlayer.socketId).emit('restart', true);
				this.server.to(room.rightPlayer.socketId).emit('restart', true);
				this.service.getReady(room, client.id);
			}
		}
	}
}
