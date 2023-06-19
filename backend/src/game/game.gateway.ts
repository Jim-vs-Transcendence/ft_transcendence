import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, MessageBody, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket, Namespace } from 'socket.io';
<<<<<<< HEAD
import { GameInitData, GameUpdateData, MoveData } from './dto/gameData.dto';
import { Room, GameRoom } from './data/playerData'
=======
import { gameDataDto } from './gameDto/gameData.dto';
import { Room } from './data/playerData'
>>>>>>> 045c0a6502635c2d25f0642d86671f877cc9d979
import { GameService } from './game.service';
/* 
 * service : gateway에서 호출되어 게임 내부 로직 변경 (현재 게이트웨이에 있는 private 함수들)
 * gateway : 클라이언트에서 받은 소켓 정보를 service 함수를 호출하여 핸들링
 * 
 * 문제는 gateway에서 rooms 배열을 가지고 있는데, timeout 함수 호출 시 해당 room을 지워야 함.
 * 그러면 gateway에서 room을 찾아 지워주는 함수를 만들고, service에서 gateway함수를 호출하여 해당 room 삭제 되게
 * -> 서비스에서 constructor로 게이트웨이를 가지고 있으니까 해당 요소를 불러서 삭제하도록 하면 될 듯?
 */


@WebSocketGateway({ namespace: '/game', cors: true })
// implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Namespace;

	private service: GameService;
<<<<<<< HEAD
	public rooms = new Map<string, Room>();
	public roomKey = new Map<string, string>();
	private players: GameInitData[];

	constructor() {
		this.service = new GameService(this);
		this.rooms;
=======
	public rooms: Room[];
	private players: gameDataDto[];

	constructor() {
		this.service = new GameService(this);
		this.rooms = [];
>>>>>>> 045c0a6502635c2d25f0642d86671f877cc9d979
		this.players = [];
	}
	// Canvas Info


	afterInit(server: Server) {
		console.count('Init');
		this.server.server.engine.opts.pingTimeout = 20000;
		this.server.server.engine.opts.pingInterval = 20000;
		this.server.server.engine.opts.upgradeTimeout = 20000;
	}

	handleDisconnect(client: Socket) {
<<<<<<< HEAD
		let destroyedRoom: string = this.roomKey.get(client.id);
		let room: Room = this.rooms.get(destroyedRoom);
		if (room.leftPlayer.socketId === client.id) {
			// rightPlayer win
		}
		else {
			// leftPlayer Win
		}
		this.service.endGame(room);
		console.log('disconnect', client.id);
	}

	public findRoom(roomName: string): Room {
		let room: Room = this.rooms.get(roomName);
		return room;
	}

	@SubscribeMessage('waitListInit')
	handleConnection(
		@ConnectedSocket() client: Socket
	) {
		console.log('connect', client.id);
		this.server.to(client.id).emit('waitListInit', true);
	}

	@SubscribeMessage('TEST')
	handleGotoInGameHandler(
		@ConnectedSocket() client: Socket,
		@MessageBody() RoomName: string,
	) {
		let room = this.findRoom(RoomName);
		if (room) {
			if (RoomName === client.id)
				this.server.to(client.id).emit('connected', room.leftPlayer);
			else
				this.server.to(client.id).emit('connected', room.rightPlayer);
		}
	}

	@SubscribeMessage('waitListInit')
	pushPlayer(
		@ConnectedSocket() client: Socket,
		@MessageBody() userId: string,
	) {
		console.log(client.id);
		let player: GameInitData = new GameInitData();
		player.updateData = new GameUpdateData();
		player.updateData.moveData = new MoveData();

		this.service.initPlayer(player, client.id);
		this.players.push(player);

		if (this.players.length >= 2) {
			console.log(this.players.length);
			let room: Room = new Room();

			room.leftPlayer = this.players.shift();
			room.rightPlayer = this.players.shift();
			this.rooms.set(room.leftPlayer.socketId, room);

			this.roomKey.set(room.leftPlayer.socketId, room.leftPlayer.socketId);
			this.roomKey.set(room.rightPlayer.socketId, room.leftPlayer.socketId);

			this.server.to(room.leftPlayer.socketId).emit('roomName', room.leftPlayer.socketId);
			this.server.to(room.rightPlayer.socketId).emit('roomName', room.leftPlayer.socketId);
		}
	}

	@SubscribeMessage('optionReady')
	handleOptionReady(
		@ConnectedSocket() client: Socket,
		@MessageBody() Room: GameRoom,
	) {
		let room = this.findRoom(Room._roomName);
		if (room) {
			this.service.setOption(room, Room);
			this.service.optionReady(room, client.id);
		}
		else {
			console.log('no room');
		}
	}
=======
		console.log('game disconnect');
		//console.log('disconnect');
		console.log(client.id);
	}


	public findRoom(roomName: string): Room {
		let room: Room = this.rooms.find((room: Room) =>
			room.roomName === roomName);
		return room;
	}

	@SubscribeMessage('connect')
	handleConnection(
		@ConnectedSocket() client: Socket
	) {

		this.server.to(client.id).emit('handShaking', true);
	}

	@SubscribeMessage('handShaking')
	pushPlayer(
		@ConnectedSocket() client: Socket,
		@MessageBody() flag: boolean,
	) {
		if (flag) {
			let player: gameDataDto = new gameDataDto();
			this.service.initPlayer(player, client.id);
			console.log(player);
			this.server.to(client.id).emit('connected', player);
			this.players.push(player);
			if (this.players.length >= 2) {
				console.log(this.players.length);
				let room: Room = new Room();
				room.leftPlayer = this.players.shift();
				room.rightPlayer = this.players.shift();
				room.roomName = room.leftPlayer.socketId;
				room.leftPlayer.roomName = room.roomName;
				room.rightPlayer.roomName = room.roomName;
				this.rooms.push(room);
				this.server.to(room.leftPlayer.socketId).emit('roomName', room.roomName);
				this.server.to(room.rightPlayer.socketId).emit('roomName', room.roomName);
			}
		}
	}

>>>>>>> 045c0a6502635c2d25f0642d86671f877cc9d979

	// Enter Key pressed : game ready
	@SubscribeMessage('gameReady')
	handleEnter(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomName: string,
	) {
<<<<<<< HEAD
=======
		console.log(roomName);
>>>>>>> 045c0a6502635c2d25f0642d86671f877cc9d979
		let room = this.findRoom(roomName);
		if (room) {
			this.service.getReady(room, client.id);
		}
		else {
			console.log('no room');
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
			console.log('No such room');
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
<<<<<<< HEAD
}

// 	@SubscribeMessage('gameRestart')
// 	waitTester(
// 		@ConnectedSocket() client: Socket,
// 		@MessageBody() roomName: string,
// 	) {

// 		let room = this.findRoom(roomName);
// 		if (room) {
// 			if (client.id === room.leftPlayer.socketId) {
// 				room.leftReady = true;
// 			}
// 			else {
// 				room.rightReady = true;
// 			}
// 			if (room.leftReady && room.rightReady) {
// 				clearTimeout(room.endTimer);
// 				this.server.to(room.leftPlayer.socketId).emit('restart', true);
// 				this.server.to(room.rightPlayer.socketId).emit('restart', true);
// 				this.service.getReady(room, client.id);
// 			}
// 		}
// 	}
// }
=======


	@SubscribeMessage('leftTest')
	waitTester(
		@ConnectedSocket() client: Socket,
		@MessageBody() roomName: string,
	) {
		console.log(roomName);
		let room = this.findRoom(roomName);
		if (room) {
			console.log(room.endTimer);
			clearTimeout(room.endTimer);
		}
	}
}
>>>>>>> 045c0a6502635c2d25f0642d86671f877cc9d979
