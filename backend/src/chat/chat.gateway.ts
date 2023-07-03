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
import { DmChatDTO, ChatMsgDTO, ChatRoomDTO, ChatAuthDTO, RoomCheckDTO, ChatRoomJoinDTO, ChatUserDTO, Authority, ChatRoomSendDTO, ChatActionDTO } from './dto/chat.dto';
import { UsersService } from 'src/users/users.service';
import userDTO from 'src/users/user.dto';
import { userInfo } from 'os';
import { channel } from 'diagnostics_channel';
import { timeout } from 'rxjs';
import { parentPort } from 'worker_threads';
'../../'
// let channel_list = new Map<string, ChatRoom>();
let channel_list: Map<string, ChatRoomDTO> = new Map<string, ChatRoomDTO>();
let socket_list: Map<string, Socket> = new Map<string, Socket>();


@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	constructor(private readonly userService: UsersService) { }

	@WebSocketServer() server: Namespace;

	afterInit(server: Server) {
		console.count('Init');
		this.server.server.engine.opts.pingTimeout = 20000;
		this.server.server.engine.opts.pingInterval = 20000;
		this.server.server.engine.opts.upgradeTimeout = 40000;

		//// 이게 문제네...
		this.server.adapter.on("delete-room", (room: string) => {
			channel_list.delete(room);
			this.server.emit('room-refresh', this.ft_room_list());
		})

		//// 이거 따로 여기한이유 생각안남..
		this.server.adapter.on("leave-room", (room: string, id: string) => {
			const client: Socket = this.server.sockets.get(id);
			const userid: string | String[] = client.handshake.query._userId;
			if (typeof userid === "string")
				this.ft_channel_leave(room, userid);
		})
	}

	// chat.gateway.ts
	async handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
		this.server.adapter.rooms // ???? 왜잇음?
		let userid: string | string[] = client.handshake.query._userId;
		// let userdata = await this.userService.findOne(userid as string);
		if (typeof userid === 'string') {
			if (!socket_list.has(userid))
				socket_list.set(userid, client);
			else // for test in duplicate user
			{
				let num: number = 0;
				while (socket_list.has(userid + "_" + num.toString()))
					num++;
				client.handshake.query._userId = userid + "_" + num.toString();
				userid = client.handshake.query._userId;
				socket_list.set(userid, client);
			}
		}
		console.log('\x1b[38;5;154m Chat Connection: ', userid, " : ", client.id + "\x1b[0m");
		client.emit('room-refresh', this.ft_room_list());
	}


	handleDisconnect(@ConnectedSocket() client: Socket) {
		const userid: string | string[] = client.handshake.query._userId;
		console.log('\x1b[38;5;196m Disconnect: ', userid, " : ", client.id, "\x1b[0m");
		if (typeof userid === 'string')
			socket_list.delete(userid);
		this.userService.updateUserStatus(client.handshake.query._userId as string, 0);
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
	async ft_room_create(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatRoomJoinDTO,
	) {
		console.log('\x1b[38;5;226m room-create \x1b[0m : ');
		if (this.server.adapter.rooms.has(payload._room_name)) {
			payload._pass = false; client.emit('room-create', payload); return;
		}
		const userid: string | string[] = client.handshake.query._userId;
		payload._pass = true;
		client.join(payload._room_name);
		if (typeof userid === "string") {
			await this.ft_channel_room_create(payload, userid);
			await this.ft_channel_auth_admin(payload._room_name, userid);
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
	async ft_channel_room_create(payload: ChatRoomJoinDTO, userid: string) {
		let room: ChatRoomDTO = {
			_name: payload._room_name,
			_password: payload._room_password,
			_users: new Map<string, ChatUserDTO>(),
			_ban_user: [],
		};
		let user_info: ChatUserDTO = new ChatUserDTO();
		user_info._authority = Authority.OWNER;
		user_info._is_muted = false;
		if (userid.indexOf("_") === -1)
			user_info._user_info = await this.userService.findOne(userid);
		else {
			user_info._user_info = await this.userService.findOne(userid.substring(0, userid.indexOf("_")));
			user_info._user_info.id = userid;
		}
		room._users.set(userid, user_info);
		channel_list.set(payload._room_name, room);
		console.log("\x1b[38;5;150m; ft_channel_room_create \x1b[0m :", room._name);
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
	async ft_room_join(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatRoomJoinDTO,
	) {
		console.log("\x1b[38;5;226m room-join \x1b[0m :");
		const userid: string = client.handshake.query._userId as string;
		payload._pass = false;
		payload._ban = false;
		if (!this.server.adapter.rooms.has(payload._room_name))
			return client.emit('room-join', payload);
		if (channel_list.get(payload._room_name)._ban_user.includes(client.handshake.query._userId as string)) {
			payload._ban = true;
			return client.emit('room-join', payload);
		}
		if (!await this.ft_channel_join(payload, userid))
			return client.emit('room-join', payload);
		// refactoring
		const channel = channel_list.get(payload._room_name);
		const channelSendDTO: ChatRoomSendDTO = {
			_name: channel._name,
			_password: channel._password,
			_users: Array.from(channel._users),
			_ban_user: channel._ban_user,
		}
		client.join(payload._room_name);
		this.server.to(payload._room_name).emit('chat-refresh', channelSendDTO);
		// refactoring end
		payload._pass = true;
		client.emit('room-join', payload);
	}


	async ft_channel_join(payload: ChatRoomJoinDTO, userid: string) {
		const room = channel_list.get(payload._room_name);
		if (room !== undefined) {
			if (room._password !== payload._room_password)
				return 0;
			else {
				const user_info: ChatUserDTO = new ChatUserDTO();
				user_info._authority = Authority.USER;
				user_info._is_muted = false;
				if (userid.indexOf("_") === -1)
					user_info._user_info = await this.userService.findOne(userid);
				else // for local test
				{
					user_info._user_info = await this.userService.findOne(userid.substring(0, userid.indexOf("_")));
					user_info._user_info.id = userid;
				}
				room._users.set(userid, user_info);
				console.log("\x1b[38;5;177m ft_channel_join \x1b[0m :", userid);
				return 1;
			}
		}
		return 0;
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
	ft_room_list(): ChatRoomJoinDTO[] {
		let room_list: ChatRoomJoinDTO[] = [];
		channel_list.forEach((val, key) => {
			let room: ChatRoomJoinDTO = new ChatRoomJoinDTO();
			room._room_name = val._name;
			room._room_password = "";
			if (val._password)
				room._is_passworded = true;
			else
				room._is_passworded = false;
			room._pass = false;
			room_list.push(room);
		})
		return room_list;
	}
	/* ================================================================================
									room leave
	   ================================================================================ */

	ft_channel_leave(channel_name: string, userid: string) {
		console.log("\x1b[38;5;021m; ft_channel_leave \x1b[0m :", channel_name, " : ", userid);
		const channel = channel_list.get(channel_name);
		if (channel !== undefined) {
			if (channel._users.has(userid)) {
				this.ft_channel_auth_delete(channel_name, userid, userid);
				channel._users.delete(userid);
				this.ft_chat_refresh_all(channel);
				if (socket_list.get(userid)) {
					socket_list.get(userid).emit("chat-leave", "leave");
				}
			}
		}
	}

	/* ================================================================================
									room auth
	   ================================================================================ */

	/**
	 * @name ft_chat_set_admin
	 * @param client 
	 * @param payload 
	 * @emits client => "chat-set-admin"
	 * @returns 
	 */
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

	/**
	 *
	 * @param client
	 * @param payload
	 */
	@SubscribeMessage("chat-auth-user")
	ft_chat_auth_user(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatActionDTO,
	) {
		console.log("\x1b[38;5;226m chat-auth-user \x1b[0m :", payload);
		if (payload._action == "appoint") {
			this.ft_channel_auth_set(payload._channel_name, payload._user_from, payload._user_to);
		}
		else if (payload._action == "unappoint") {
			this.ft_channel_auth_delete(payload._channel_name, payload._user_from, payload._user_to);
		}
	}

	ft_channel_auth_admin(channel_name: string, userid: string): number {
		console.log("\x1b[38;5;021m ft_channel_auth_admin \x1b[0m :", channel_name, " : ", userid);
		let channel: ChatRoomDTO = channel_list.get(channel_name);
		let check: boolean = true;
		if (channel._users.size) {
			channel._users.forEach((user, UID) => {
				if (user._authority == Authority.OWNER)
					check = false;
			});
		}
		if (check) {
			const curr_user: ChatUserDTO = channel._users.get(userid);
			curr_user._authority = Authority.OWNER;
		}
		return (0);
	}

	ft_channel_auth_set(channel_name: string, user_grantor: string, user_heritor: string): number {
		console.log("\x1b[38;5;021m ft_channel_auth_set \x1b[0m :", channel_name, " : ", user_grantor, " => ", user_heritor);
		let channel: ChatRoomDTO = channel_list.get(channel_name);
		if (channel._users.get(user_grantor)._authority <= Authority.MANAGER) {
			if (channel._users.has(user_heritor)
				&& channel._users.get(user_grantor)._authority == Authority.OWNER) {
				const user_herit: ChatUserDTO = channel._users.get(user_heritor);
				user_herit._authority = Authority.MANAGER;
				socket_list.get(user_heritor).emit("chat-self-update", channel._users.get(user_heritor));
				this.ft_chat_refresh_all(channel);
				return (0);
			}
		}
		return (1);
	}

	ft_channel_auth_delete(channel_name: string, user_grantor: string, user_heritor: string): number {
		console.log("\x1b[38;5;199m ft_channel_auth_delete \x1b[0m :", channel_name, " : ", user_grantor, " => ", user_heritor);
		let channel: ChatRoomDTO = channel_list.get(channel_name);
		let check: number = 0;

		if (user_grantor === user_heritor) {
			if (!channel._users.has(user_grantor))
				return (1);
			if (channel._users.get(user_grantor)._authority == Authority.OWNER) {
				if (channel._users.size > 1) {
					channel._users.forEach((user, UID) => {
						if (!check && UID != user_grantor && user._authority == 1 && ++check)
							return user._authority = Authority.OWNER;
					});
					channel._users.forEach((user, UID) => {
						if (!check && UID != user_grantor && ++check)
							return user._authority = Authority.OWNER;
					});
				}
			}
			channel._users.get(user_grantor)._authority = Authority.USER;
			socket_list.get(user_heritor).emit("chat-self-update", channel._users.get(user_heritor));
			this.ft_chat_refresh_all(channel);
			return (0);
		}
		if (channel._users.get(user_grantor)._authority < channel._users.get(user_heritor)._authority) {
			channel._users.get(user_heritor)._authority = Authority.USER;
			socket_list.get(user_heritor).emit("chat-self-update", channel._users.get(user_heritor));
			this.ft_chat_refresh_all(channel);
			return (0);
		}
		return (1);
	}

	/* ================================================================================
									room kick
	   ================================================================================ */

	/**
	 *
	 * @param client
	 * @param payload
	 */
	@SubscribeMessage("chat-kick-user")
	ft_chat_kick_user(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatActionDTO,
	) {
		console.log("\x1b[38;5;021m ft_chat_kick_user \x1b[0m :", payload._channel_name, " : ", payload._user_to);
		this.ft_channel_kick(payload._channel_name, payload._user_from, payload._user_to);
		this.ft_chat_refresh_all(channel_list.get(payload._channel_name));
	}

	ft_channel_kick(channel_name: string, user_grantor: string, user_heritor: string) {
		console.log("\x1b[38;5;021m ft_channel_kick \x1b[0m :", channel_name, " : ", user_grantor, " => ", user_heritor);
		let channel: ChatRoomDTO = channel_list.get(channel_name);

		console.log("kick test : ", channel._users.get(user_grantor)._authority, Authority.MANAGER);
		if (channel._users.get(user_grantor)._authority <= Authority.MANAGER) {
			console.log("kick test :2 ", channel._users.has(user_heritor));
			if (channel._users.has(user_heritor)
				&& channel._users.get(user_grantor)._authority < channel._users.get(user_heritor)._authority) {
				this.ft_channel_leave(channel_name, user_heritor);
			}
		}
	}

	/* ================================================================================
									room mute
	   ================================================================================ */

	/**
	 *
	 * @param client
	 * @param payload
	 */
	@SubscribeMessage("chat-mute-user")
	ft_chat_mute_user(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatActionDTO,
	) {
		console.log("\x1b[38;5;021m ft_chat_mute_user\x1b[0m :", payload);
		if (payload._action == "mute")
			this.ft_channel_mute(payload._channel_name, payload._user_from, payload._user_to);
		else if (payload._action == "unmute")
			this.ft_channel_unmute(payload._channel_name, payload._user_from, payload._user_to);

		this.ft_chat_refresh_all(channel_list.get(payload._channel_name));
	}

	ft_channel_mute_self(channel_name: string, user: string) {
		let channel: ChatRoomDTO = channel_list.get(channel_name);
		if (channel._users.has(user)) {
			channel._users.get(user)._is_muted = true;
			return (0);
		}
		return (1);
	}
	ft_channel_unmute_self(channel_name: string, user: string) {
		let channel: ChatRoomDTO = channel_list.get(channel_name);
		if (channel._users.has(user)) {
			channel._users.get(user)._is_muted = false;
			return (0);
		}
		return (1);
	}

	ft_channel_mute(channel_name: string, user_grantor: string, user_heritor: string) {
		let channel: ChatRoomDTO = channel_list.get(channel_name);
		if (channel._users.get(user_grantor)._authority < Authority.MANAGER
			&& channel._users.has(user_heritor)) {
			channel._users.get(user_heritor)._is_muted = true;
			setTimeout(() => {
				channel._users.get(user_heritor)._is_muted = false;
				this.ft_chat_refresh_all(channel);
			}, 30000);
			return (0);
		}
		return (1)
	}

	ft_channel_unmute(channel_name: string, user_grantor: string, user_heritor: string) {
		let channel: ChatRoomDTO = channel_list.get(channel_name);
		if (channel._users.get(user_grantor)._authority < Authority.MANAGER
			&& channel._users.has(user_heritor)) {
			channel._users.get(user_heritor)._is_muted = false;
			return (0);
		}
		return (1)
	}

	/* ================================================================================
									room ban
	   ================================================================================ */

	/**
	 *
	 * @param client
	 * @param payload
	 */
	@SubscribeMessage("chat-ban-user")
	ft_chat_ban_user(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: ChatActionDTO,
	) {
		this.ft_channel_ban(payload._channel_name, payload._user_from, payload._user_to);
		this.ft_chat_refresh_all(channel_list.get(payload._channel_name));
	}


	ft_channel_ban(channel_name: string, user_grantor: string, user_heritor: string) {
		let channel: ChatRoomDTO = channel_list.get(channel_name);
		if (channel._users.has(user_grantor)) {
			if (channel._users.has(user_heritor) &&
				channel._users.get(user_grantor)._authority > channel._users.get(user_heritor)._authority) {
				// 능력밖 밴 금지
				return (1);
			}
			if (channel._ban_user.indexOf(user_heritor) != -1)
				return (2); // 이미 존제
			channel._ban_user.push(user_heritor);
			this.ft_channel_kick(channel_name, user_grantor, user_heritor);
			setTimeout(() => {
				channel._ban_user.splice(channel._ban_user.indexOf(user_heritor), 1);
				this.ft_chat_refresh_all(channel);
			}, 30000);
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
		// refactoring
		const channel = channel_list.get(payload);
		// refactoring end
		if (channel !== undefined) {
			const channelSendDTO: ChatRoomSendDTO = {
				_name: channel._name,
				_password: channel._password,
				_users: Array.from(channel._users),
				_ban_user: channel._ban_user,
			}
			client.emit('chat-refresh', channelSendDTO);
		}
		else
			client.emit('chat-refresh', 'chat refresh error!')
	}

	ft_chat_refresh_all(channel: ChatRoomDTO) {

		const send: ChatRoomSendDTO = {
			_name: channel._name,
			_password: channel._password,
			_users: Array.from(channel._users),
			_ban_user: channel._ban_user,
		}
		channel._users.forEach((val, key) => {
			socket_list.get(key).emit("chat-refresh", send)
		})
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
	async ft_chat_connect(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: RoomCheckDTO,
	) {
		console.log("\x1b[38;5;226m ft_chat_connect \x1b[0m :");
		if (!this.server.adapter.rooms.has(payload._room)) {
			// console.log("\x1b[38;5;196m Error :: \x1b[0m chat-connect url is not enable");
			payload._check = false;
		}
		payload._check = true;
		const userid: string = client.handshake.query._userId as string;
		payload._user = channel_list.get(payload._room)._users.get(userid);
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
		console.log("\x1b[38;5;226m chat-msg-event \x1b[0m :", payload._room_name, userid);
		if (!this.server.adapter.rooms.has(payload._room_name)) {
			console.log("\x1b[38;5;196m Error :: \x1b[0m chat-connect url is not enable");
			return;
		}
		if (channel_list.get(payload._room_name)._users.get(userid as string)._is_muted) {
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
		client.leave(payload._room_name);
		this.ft_channel_leave(payload._room_name,payload._user_name);
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
			// client.emit('dm-chat-to-ui', payload);
			client.emit('dm-chat', payload);
			return;
		}
		socket_list.get(payload._to).emit('dm-chat', payload);
		socket_list.get(payload._to).emit('dm-chat-to-ui', payload);
	}

	// ================================================================================ //
	/* =                                                                              =
									utile                                    
	   =                                                                              = */
	// ================================================================================ //

	async ft_user_info_maker(userid: string): Promise<ChatUserDTO> {
		let user_info: ChatUserDTO = new ChatUserDTO();
		user_info._authority = Authority.USER;
		user_info._is_muted = false;
		if (userid.indexOf("_") === -1)
			user_info._user_info = await this.userService.findOne(userid);
		else {
			user_info._user_info = await this.userService.findOne(userid.substring(0, userid.indexOf("_")));
			user_info._user_info.id = userid;
		}
		return (user_info);
	}
}