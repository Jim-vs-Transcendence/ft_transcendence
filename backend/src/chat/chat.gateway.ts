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
import { DmChatDTO, ChatMsgDTO, ChatRoomDTO, PayLoadDTO, ChatUser, ChatRoom } from './dto/chat.dto';
import { UsersService } from 'src/users/users.service';
'../../'
// let channel_list = new Map<string, ChatRoom>();
let channel_list: Map<string, ChatRoom> = new Map<string, ChatRoom>();
let socket_list: Map<string, ChatUser> = new Map<string, ChatUser>();
let socket_to_user: Map<string, string> = new Map<string, string>();

enum chat_auth {
	USER,
	MANAGER,
	OWNER
}
@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Namespace;

	afterInit(server: Server) {
		console.count('Init');
		this.server.server.engine.opts.pingTimeout = 20000;
		this.server.server.engine.opts.pingInterval = 20000;
		this.server.server.engine.opts.upgradeTimeout = 20000;
	}

	// chat.gateway.ts
	async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
		const userid: string | string[] = client.handshake.query.userid;
		console.log('\x1b[38;5;154m Connection: ', userid, " : ", client.id + "\x1b[0m");
		if (typeof userid === 'string') {
			socket_list.set(userid, new ChatUser());
			socket_list.get(userid)._socket = client;
			socket_to_user.set(client.id, userid);
			client.join('defult');
			client.leave(client.id);
		}
		client.emit('room-refresh', this.ft_room_list());
	}

	handleDisconnect(@ConnectedSocket() client: Socket) {
		console.log('\x1b[38;5;196m Disconnect: ', socket_to_user.get(client.id), " : ", client.id, "\x1b[0m");
		const userid: string | string[] = client.handshake.query.userId;
		if (typeof userid === 'string')
			if (socket_list.get(userid)._socket.id === client.id) {
				socket_list.get(userid)._channel.forEach((val) => {
					console.log("channel : ", val);
				})
				socket_list.delete(userid);
				socket_to_user.delete(userid);
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
		payload._pass = true;
		client.join(payload._room_name);
		channel_list.set(payload._room_name, this.ft_channel_room_create(payload, socket_to_user.get(client.id)));
		this.ft_channel_auth_admin(payload._room_name, socket_to_user.get(client.id));
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
			_user: new Map<string, ChatUser>(),
			_auth_user: new Map<string, number>()
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
		if (!this.server.adapter.rooms.has(payload._room_name))
			return client.emit('room-join', {});
		if (!this.ft_channel_join(payload, socket_to_user.get(client.id)))
			return;
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

	ft_user_map_to_string(user_list: Map<string, ChatUser>): string[] {
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
		console.log("\x1b[38;5;199m ft_channel_leave \x1b[0m :", channel_name, " : ", userid );
		if (channel_list.get(channel_name)._user.get(userid)) 
		{
			this.ft_channel_auth_delete(channel_name, userid);
			channel_list.get(channel_name)._user.delete(userid);
			if (channel_list.get(channel_name)._user.size == 0)
				channel_list.delete(channel_name);
		}

	}

	/* ================================================================================
									room auth
	   ================================================================================ */

	ft_channel_auth_admin(channel_name: string, userid: string) {
		console.log("\x1b[38;5;021m ft_channel_auth_admin \x1b[0m :", channel_name, " : ", userid);
		channel_list.get(channel_name)._auth_user.set(userid, 2);
	}

	ft_channel_auth_set(channel_name: string, user_grantor: string, user_heritor: string) {
		console.log("\x1b[38;5;021m ft_channel_auth_set \x1b[0m :", channel_name, " : ", user_grantor , " => ", user_heritor );
		let channel = channel_list.get(channel_name);
		if (channel._auth_user.get(user_grantor) >= 1) {
			if (!channel._auth_user.get(user_heritor)
				&& channel._auth_user.get(user_heritor) != 2) {
				channel._auth_user.set(user_heritor, 1);
			}
		}
	}

	ft_channel_auth_delete(channel_name: string, user_name: string) {
		console.log("\x1b[38;5;199m ft_channel_auth_delete \x1b[0m :", channel_name, " : ", user_name );
		let channel = channel_list.get(channel_name);
		let on : number = 0;

		if (channel._auth_user.get(user_name) == 2) {
			if (channel._auth_user.size > 1) {
				channel._auth_user.forEach((val, key) => {
					if (key != user_name && !on && ++on)
						return channel._auth_user.set(key, 2);
				});
			}
			else if (channel._user.size > 1) {
				channel._user.forEach((val, key) => {
					if (key != user_name && !on && ++on)
						return channel._auth_user.set(key, 2);
				});
			}
		}
		channel._auth_user.delete(user_name);
	}

	/* ================================================================================
									room auth
	   ================================================================================ */

	ft_channel_kick(channel_name: string, user_grantor: string, user_heritor: string) {
		if (channel_list.get(channel_name)._auth_user.get(user_grantor) > 1) {
			if (!channel_list.get(channel_name)._auth_user.has(user_heritor))
				this.ft_channel_leave(channel_name, user_heritor);
			if (channel_list.get(channel_name)._auth_user.get(user_grantor) > channel_list.get(channel_name)._auth_user.get(user_heritor))
				this.ft_channel_leave(channel_name, user_heritor);
		}
	}


	// ================================================================================ //
	/* =                                                                              =
									chat                                    
	   =                                                                              = */
	// ================================================================================ //

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
		console.log('chat-msg-event', payload);
		if (!this.server.adapter.rooms.has(payload._room_name)) {
			console.log("\x1b[38;5;196m Error :: \x1b[0m chat-connect url is not enable");
			return;
		}
		client.to(payload._room_name).emit('chat-msg-event', payload);
		client.emit("chat-msg-event",payload._msg );
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
		console.log("\x1b[38;5;227m chat-exit-room \x1b[0m", payload._room_name);
		client.leave(payload._room_name);
		if (!this.server.adapter.rooms.has(payload._room_name)) {
			this.ft_channel_leave(payload._room_name, socket_to_user.get(client.id));
			this.server.emit('room-refresh', this.ft_room_list());
		}
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
			console.log(
				'\x1b[38;5;196m',
				'Error ::',
				'\x1b[0m',
				'socket is not enable',
			);
			client.emit('dm-chat', payload);
			return;
		}
		socket_list.get(payload._to)._socket.emit('dm-chat', payload);
		// client.emit("chat-msg-event",payload._msg );
	}
}
