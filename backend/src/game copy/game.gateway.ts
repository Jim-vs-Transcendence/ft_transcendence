import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, MessageBody, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket, Namespace } from 'socket.io';
import { GameInitData, GameUpdateData, MoveData } from './dto/gameData.dto';
import { Room, GameRoom } from './data/playerData'
import { GameService } from './game.service';
import { User } from '../users/entities/user.entity'
import { Injectable } from '@nestjs/common';
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
// implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Namespace;

	private service: GameService;

	// rooms : 2명의 클라이언트가 들어있는 게임 룸
	public rooms = new Map<string, Room>();

	// refresh될 때 disconnect된 방을 찾기 위한 socket.id와 roomName을 저장한 자료구조
	public roomKey = new Map<string, string>();

	// userid가 키로써 User 데이터 자체를 가지고 있는 자료구조
	public userData = new Map<string, User>();

	private players: GameInitData[];

	constructor(
		public userRService: UsersService,
	) {
		this.service = new GameService(this);
		this.rooms;
		this.players = [];
	}
	// Canvas Info

	@SubscribeMessage('mainConnect')
	handleConnection(
		@ConnectedSocket() client: Socket
	) {
		// chat 쪽에서 알아서 해줄거임
	}

	afterInit(server: Server) {
		console.count('Init');
		this.server.server.engine.opts.pingTimeout = 20000;
		this.server.server.engine.opts.pingInterval = 20000;
		this.server.server.engine.opts.upgradeTimeout = 20000;
	}

	handleDisconnect(client: Socket) {
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
