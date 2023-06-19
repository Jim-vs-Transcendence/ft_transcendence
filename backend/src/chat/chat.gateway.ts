import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';
import { ConnectionClosedEvent } from 'typeorm';
import { DmChatDTO, ChatMsgDTO, ChatRoomDTO, PayLoadDTO, ChatRoom, ChatAuthDTO, ChatRefreshDTO, ChatUser } from './dto/chat.dto';
import { UsersService } from 'src/users/users.service';
'../../'
// let channel_list = new Map<string, ChatRoom>();
let channel_list: Map<string, ChatRoom> = new Map<string, ChatRoom>();
let socket_list: Map<string, Socket> = new Map<string, Socket>();

enum chat_auth {
	USER,
	MANAGER,
	OWNER
}
@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	constructor(private readonly userService: UsersService) { }
	
	@WebSocketServer() server: Namespace;

	afterInit(server: Server) {
		console.count('Init');
		this.server.server.engine.opts.pingTimeout = 20000;
		this.server.server.engine.opts.pingInterval = 20000;
		this.server.server.engine.opts.upgradeTimeout = 20000;
	}

	// chat.gateway.ts
	async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
		const userid: string | string[] = client.handshake.query._userId;
		console.log('\x1b[38;5;154m Connection: ', userid, " : ", client.id + "\x1b[0m");
		let userdata = await this.userService.findOne(userid as string);
		if (typeof userid === 'string') {
			if (!socket_list.has(userid))
			socket_list.set(userid, client);
			else // for test in duplicate user
			{
				let num : number = 0;
				while (socket_list.has(userid + "_" + num.toString()))
				num++;
				socket_list.set(userid + "_" + num.toString(), client);
				client.handshake.query._userId = userid + "_" + num.toString();
				client.handshake.query._avatar = userdata.avatar;
			}
		}
		client.emit('room-refresh', this.ft_room_list());
	}

	
	handleDisconnect(@ConnectedSocket() client: Socket) {
		const userid: string | string[] = client.handshake.query._userId;
		console.log('\x1b[38;5;196m Disconnect: ', userid, " : ", client.id, "\x1b[0m");
		if (typeof userid === 'string')
		{
			if (socket_list.get(userid).id === client.id) {
				client.rooms.forEach((val, key) => {
					this.ft_channel_leave(key, userid);
				})
				socket_list.delete(userid);
			}
		}
		client.emit('room-refresh', this.ft_room_list());
	}

	// ================================================================================ //
	/* =                                                                              =
									room                                     
	   =                                                                              = */
	// ================================================================================ //
	/* ================================================================================
									room create
	   ================================================================================ */

	/**
	 * @name ft_room_create
	 * @param client
	 * @param payload
	 * @emits server => "room-refresh"
	 * @brief 방 생성시 실행
	 */
	@SubscribeMessage('room-create')
	ft_room_create(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatRoomDTO,
	) {
		console.log('\x1b[38;5;226m room-create \x1b[0m : ', payload);
		if (this.server.adapter.rooms.has(payload._room_name)) {
			payload._pass = false;
			client.emit('room-create', payload);
			return;
		}
		const userid: string | string[] = client.handshake.query._userId;
		payload._pass = true;
		client.join(payload._room_name);
		if (typeof userid === "string") {
			channel_list.set(payload._room_name, this.ft_channel_room_create(payload, userid));
			this.ft_channel_auth_admin(payload._room_name, userid);
		}
		client.emit('room-create', payload);
		this.server.emit('room-refresh', this.ft_room_list());
	}

	/**
	 * @name ft_channel_room_create
	 * @param payload 
	 * @param userid 
	 * @brief 방만들기 세팅용 
	 * @returns 
	 */
	ft_channel_room_create(payload: ChatRoomDTO, userid: string): ChatRoom {
		let room: ChatRoom = {
			_name: payload._room_name,
			_password: payload._room_password,
			_user: new Map<string, Socket>(),
			_auth_user: new Map<string, number>(),
			_ban_user: [],
			_mute_user: [],
		};
		room._user.set(userid, socket_list.get(userid));
		room._auth_user.set(userid, chat_auth.OWNER);
		return (room);
	}


	/* ================================================================================
									room join
	   ================================================================================ */

	/**
	 * @name ft_room_join
	 * @param client
	 * @param payload
	 * @emits client => "room-join"
	 * @brief 방 접속
	 */
	@SubscribeMessage('room-join')
	ft_room_join(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatRoomDTO,
	) {
		console.log("\x1b[38;5;226m room-join \x1b[0m :", payload);
		const userid: string | string[] = client.handshake.query._userId;
		if (!this.server.adapter.rooms.has(payload._room_name))
			return client.emit('room-join', {});
		if (typeof userid === "string") {
			if (!this.ft_channel_join(payload, userid))
				return;
		}
		payload._pass = true;
		client.join(payload._room_name);
		client.emit('room-join', payload);
	}


	ft_channel_join(payload: ChatRoomDTO, userid: string) {
		if (channel_list.get(payload._room_name)._password != payload._room_password) {
			payload._pass = false;
			return 0;
		}
		channel_list.get(payload._room_name)._user.set(userid, socket_list.get(userid));
		return 1;
	}

	/* ================================================================================
									room refresh                                    
	   ================================================================================ */
	/**
	 * @name ft_room_refresh
	 * @param client
	 * @param payload
	 * @emits server => "room-refresh"
	 * @brief 방 리스트 목록 조회
	 */
	@SubscribeMessage('room-refresh')
	ft_room_refresh(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: string,
	) {
		console.log("\x1b[38;5;226m room-refresh \x1b[0m :", payload);
		client.emit('room-refresh', this.ft_room_list());
	}

	/**
	 * @name ft_room_list
	 * @returns room_list : RoomListDTO []
	 * @brief 방 모든 목록을 가져온다
	 */
	ft_room_list(): ChatRoomDTO[] {
		let room_list: ChatRoomDTO[] = [];
		channel_list.forEach((val, key) => {
			let room: ChatRoomDTO = new ChatRoomDTO();
			room._room_name = val._name;
			room._room_password = "";
			room._room_users = this.ft_user_map_to_string(val._user);
			room_list.push(room);
		})
		return room_list;
	}

	ft_user_map_to_string(user_list: Map<string, Socket>): string[] {
		let user: string[] = [];

		user_list.forEach((val, key) => {
			user.push(key);
		});
		return (user);
	}
	/* ================================================================================
									room leave
	   ================================================================================ */


	ft_channel_leave(channel_name: string, userid: string) {
		console.log("\x1b[38;5;021m; ft_channel_leave \x1b[0m :", channel_name, " : ", userid);
		if (channel_list.get(channel_name)._user.get(userid)) {
			this.ft_channel_auth_delete(channel_name, userid, userid);
			channel_list.get(channel_name)._user.delete(userid);
			if (channel_list.get(channel_name)._user.size == 0)
				channel_list.delete(channel_name);
		}

	}

	/* ================================================================================
									room auth
	   ================================================================================ */

	@SubscribeMessage("chat-set-admin")
	ft_chat_set_admin(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatAuthDTO,
	) {
		console.log("\x1b[38;5;226m chat-set-admin \x1b[0m :", payload);
		payload._check = false;
		if (payload._option === 2) {
			if (this.ft_channel_auth_admin(payload._room, payload._user_grantor))
				return console.log("false ft_channel_auth_admin");
			payload._check = true;
		}
		else if (payload._option === 1) {
			if (this.ft_channel_auth_set(payload._room, payload._user_grantor, payload._user_heritor))
				return console.log("false ft_channel_auth_set");
			payload._check = true;
		}
		else if (payload._option === 0) {
			if (this.ft_channel_auth_delete(payload._room, payload._user_grantor, payload._user_heritor))
				return console.log("false ft_channel_auth_delete");
			payload._check = true;
		}
		if (payload._check === true)
			this.server.to(payload._room).emit("chat-set-admin", payload);
	}


	ft_channel_auth_admin(channel_name: string, userid: string): number {
		console.log("\x1b[38;5;021m ft_channel_auth_admin \x1b[0m :", channel_name, " : ", userid);
		let channel: ChatRoom = channel_list.get(channel_name);
		let check: boolean = true;
		if (channel._auth_user.size) {
			channel._auth_user.forEach((val, key) => {
				if (val == 2)
					check = false;
			});
		}
		if (check)
			channel._auth_user.set(userid, 2);
		return (0);
	}

	ft_channel_auth_set(channel_name: string, user_grantor: string, user_heritor: string): number {
		console.log("\x1b[38;5;021m ft_channel_auth_set \x1b[0m :", channel_name, " : ", user_grantor, " => ", user_heritor);
		let channel: ChatRoom = channel_list.get(channel_name);
		if (channel._auth_user.get(user_grantor) >= 1) {
			if (!channel._auth_user.get(user_heritor)
				&& channel._auth_user.get(user_heritor) != 2) {
				channel._auth_user.set(user_heritor, 1);
				return (0);
			}
		}
		return (1);
	}

	ft_channel_auth_delete(channel_name: string, user_grantor: string, user_heritor: string): number {
		console.log("\x1b[38;5;199m ft_channel_auth_delete \x1b[0m :", channel_name, " : ", user_grantor, " => ", user_heritor);
		let channel: ChatRoom = channel_list.get(channel_name);
		let check: number = 0;

		if (user_grantor === user_heritor) {
			if (!channel._auth_user.has(user_grantor))
				return (1);
			if (channel._auth_user.get(user_grantor) == 2) {
				if (channel._auth_user.size > 1) {
					channel._auth_user.forEach((val, key) => {
						if (!check && key != user_grantor && ++check)
							return channel._auth_user.set(key, 2);
					});
				}
				else if (channel._user.size > 1) {
					channel._user.forEach((val, key) => {
						if (!check && key != user_grantor && ++check)
							return channel._auth_user.set(key, 2);
					});
				}
			}
			channel._auth_user.delete(user_grantor);
			return (0);
		}
		if (channel._auth_user.get(user_grantor) > channel._auth_user.get(user_heritor)) {
			channel._auth_user.delete(user_heritor);
			return (0);
		}
		return (1);
	}

	/* ================================================================================
									room kick
	   ================================================================================ */

	ft_channel_kick(channel_name: string, user_grantor: string, user_heritor: string) {
		let channel: ChatRoom = channel_list.get(channel_name);
		if (channel._auth_user.get(user_grantor) > 1) {
			if (!channel._auth_user.has(user_heritor))
				this.ft_channel_leave(channel_name, user_heritor);
			if (channel._auth_user.get(user_grantor) > channel._auth_user.get(user_heritor))
				this.ft_channel_leave(channel_name, user_heritor);
		}
	}

	/* ================================================================================
									room mute
	   ================================================================================ */
	ft_channel_mute_self(channel_name: string, user: string) {
		let channel: ChatRoom = channel_list.get(channel_name);
		if (channel._user.has(user)
			&& channel._mute_user.indexOf(user) == -1) {
			channel._mute_user.push(user);
			return (0);
		}
		return (1);
	}
	ft_channel_unmute_self(channel_name: string, user: string) {
		let channel: ChatRoom = channel_list.get(channel_name);
		if (channel._user.has(user)
			&& channel._mute_user.indexOf(user) != -1) {
			channel._mute_user.splice(channel._mute_user.indexOf(user), 1);
			return (0);
		}
		return (1);
	}

	ft_channel_mute(channel_name: string, user_grantor: string, user_heritor: string) {
		let channel: ChatRoom = channel_list.get(channel_name);
		if (channel._auth_user.has(user_grantor)
			&& channel._user.has(user_heritor)
			&& channel._mute_user.indexOf(user_heritor) == -1) {
			channel._mute_user.push(user_heritor);
			return (0);
		}
		return (1)
	}

	ft_channel_unmute(channel_name: string, user_grantor: string, user_heritor: string) {
		let channel: ChatRoom = channel_list.get(channel_name);
		if (channel._auth_user.has(user_grantor)
			&& channel._user.has(user_heritor)
			&& channel._mute_user.indexOf(user_heritor) != -1) {
			channel._mute_user.splice(channel._mute_user.indexOf(user_heritor), 1);
			return (0);
		}
		return (1)
	}

	/* ================================================================================
									room ban
	   ================================================================================ */
	ft_channel_ban(channel_name: string, user_grantor: string, user_heritor: string) {
		let channel: ChatRoom = channel_list.get(channel_name);
		if (channel._auth_user.has(user_grantor)) {
			if (channel._auth_user.has(user_heritor) &&
				channel._auth_user.get(user_grantor) > channel._auth_user.get(user_heritor)) {
				// 능력밖 밴 금지
				return (1);
			}
			if (channel._mute_user.indexOf(user_heritor) != -1)
				return (2); // 이미 존제
			channel._mute_user.push(user_heritor);
			return (0);
		}
		return (1);
	}

	// ================================================================================ //
	/* =                                                                              =
									chat                                    
	   =                                                                              = */
	// ================================================================================ //

	/* ================================================================================
									chat refresh
	   ================================================================================ */

	/**
	 * 
	 * @param client 
	 * @param payload 
	 */
	@SubscribeMessage('chat-refresh')
	ft_chat_refresh(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: string,
	) {
		console.log("\x1b[38;5;226m chat-refresh \x1b[0m :", payload);
		let chat_info : ChatRefreshDTO = new ChatRefreshDTO();
		let channel = channel_list.get(payload);
		chat_info._name = payload;
		chat_info._ban = channel._ban_user;
		channel._user.forEach((val, key) => {
			let chat_user : ChatUser = new ChatUser();
			chat_user._name = key;
			chat_user._mute = false;
			chat_user._auth = 0;
			chat_user._avatar = "";
			if (channel._mute_user
				&& channel._mute_user.indexOf(key) != -1)
				chat_user._mute = true;
			if (channel._auth_user
				&& channel._auth_user.has(key))
				chat_user._auth = channel._auth_user.get(key);
			chat_user._avatar = client.handshake.query._avatar as string;
			chat_info._user.push(chat_user);
			console.log(chat_user);
		});
		client.emit('chat-refresh', chat_info);
	}


	/* ================================================================================
									chat connect
	   ================================================================================ */
	/**
	 * @name ft_chat_connect
	 * @param client
	 * @param payload
	 * @emits client => "chat-connect"
	 * @brief url 이 정상적인 룸이 있는지 확인
	 */
	@SubscribeMessage('chat-connect')
	ft_chat_connect(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: PayLoadDTO,
	) {
		if (!this.server.adapter.rooms.has(payload._room)) {
			// console.log("\x1b[38;5;196m Error :: \x1b[0m chat-connect url is not enable");
			payload._check = false;
		}
		payload._check = true;
		client.emit('chat-connect', payload);
	}

	/* ================================================================================
									chat msg
	   ================================================================================ */
	/**
	 * @name ft_chat_msg_event
	 * @param client
	 * @param payload
	 * @emits client.to(room_name) => "chat-connect"
	 * @brief 채팅방 채팅 전송 기능
	 */
	@SubscribeMessage('chat-msg-event')
	ft_chat_msg_event(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatMsgDTO,
	) {
		const userid: string | string[] = client.handshake.query._userId;
		console.log("\x1b[38;5;226m chat-msg-event \x1b[0m :", payload);
		if (!this.server.adapter.rooms.has(payload._room_name)) {
			console.log("\x1b[38;5;196m Error :: \x1b[0m chat-connect url is not enable");
			return;
		}
		client.to(payload._room_name).emit('chat-msg-event', payload);
		if (typeof userid === "string") {

			payload._user_name = userid;
			client.emit("chat-msg-event", payload);
		}
	}

	/* ================================================================================
									chat exit
	   ================================================================================ */
	/**
	 * @name ft_chat_exit_room
	 * @param client
	 * @param payload
	 * @emits server => "room-refresh"
	 * @brief channel 확인 삭제
	 */
	@SubscribeMessage('chat-exit-room')
	ft_chat_exit_room(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatMsgDTO,
	) {
		const userid: string | string[] = client.handshake.query._userId;
		console.log("\x1b[38;5;227m chat-exit-room \x1b[0m", payload._room_name);
		if (typeof userid === "string") {
			if (this.server.adapter.rooms.has(payload._room_name)) {
				this.ft_channel_leave(payload._room_name, userid);
				this.server.emit('room-refresh', this.ft_room_list());
			}
		}
		client.leave(payload._room_name);
	}

	// ================================================================================ //
	/* =                                                                              =
									dm                                    
	   =                                                                              = */
	// ================================================================================ //

	/**
	   * @name ft_dm_chat
	   * @param client
	   * @param payload
	   * @emits client => "dm-chat"
	   * @brief Dm 전송 기능
	   */
	@SubscribeMessage('dm-chat')
	ft_dm_chat(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: DmChatDTO,
	) {
		if (!socket_list.has(payload._to)) {
			console.log("\x1b[38;5;196m Error :: \x1b[0m socket is not enable");
			client.emit('dm-chat', payload);
			return;
		}
		socket_list.get(payload._to).emit('dm-chat', payload);
		// client.emit("chat-msg-event",payload._msg );
	}
}
