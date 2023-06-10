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
import { ChatMsgDTO, ChatRoomDTO, PayLoadDTO } from './dto/chat.dto';

let channel_list = new Map<string, ChatRoomDTO>();

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Namespace;

  afterInit(server: Server) {
    console.count('Init');
    this.server.server.engine.opts.pingTimeout = 20000;
    this.server.server.engine.opts.pingInterval = 20000;
    this.server.server.engine.opts.upgradeTimeout = 20000;
  }

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    client.join('defult');
    client.leave(client.id);
    console.log('connect');
    console.log(client.id);
    client.emit('room-refresh', this.ft_room_list());
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('disconnect');
    console.log(client.id);
    client.emit('room-refresh', this.ft_room_list());
  }

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
    console.log(payload, client.id);
    client.emit('room-refresh', this.ft_room_list());
  }

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
    if (this.server.adapter.rooms.has(payload._room_name)) {
      client.emit('room-create', {});
      return;
    }
    console.log('room-create : ', payload);
    client.join(payload._room_name);
    channel_list.set(payload._room_name, payload);
    client.emit('room-create', payload);
    this.server.emit('room-refresh', this.ft_room_list());
  }

  /**
   * @name ft_room_create
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
    if (
      !this.server.adapter.rooms.has(payload._room_name) &&
      channel_list.get(payload._room_name)._room_password !=
        payload._room_password
    ) {
      client.emit('room-join', {});
      return;
    }
    client.join(payload._room_name);
    client.emit('room-join', channel_list.get(payload._room_name));
    // !## 선택 다시 방의 목록을 새로고침하여 안의 유저들을 확인할것인가?
  }

  /**
   * @name ft_room_list
   * @returns room_list : ChatRoomDto []
   * @brief 방 모든 목록을 가져온다
   */
  ft_room_list(): ChatRoomDTO[] {
    let room_list: ChatRoomDTO[] = [];
    channel_list.forEach((val, key) => {
      room_list.push(val);
    });
    return room_list;
  }

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
    console.log('[', client.id, '] try join room => [', payload, ']');
    console.log(this.server.adapter.rooms.has(payload._url));
    if (!this.server.adapter.rooms.has(payload._url)) {
      console.log(
        '\x1b[38;5;196m',
        'Error ::',
        '\x1b[0m',
        'chat-connect url is not enable',
      );
      payload._check = false;
    }
    client.emit('chat-connect', payload);
  }

  /**
   * @name ft_chat_msg_event
   * @param client
   * @param payload
   * @emits client.to(room_name) => "chat-connect"
   * @brief url 이 정상적인 룸이 있는지 확인
   */
  @SubscribeMessage('chat-msg-event')
  ft_chat_msg_event(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatMsgDTO,
  ) {
    console.log('chat-msg-event', payload);
    if (!this.server.adapter.rooms.has(payload._room_info._room_name)) {
      console.log(
        '\x1b[38;5;196m',
        'Error ::',
        '\x1b[0m',
        'chat-connect url is not enable',
      );
      return;
    }
    client.to(payload._room_info._room_name).emit('chat-msg-event', payload);
    // client.emit("chat-msg-event",payload._msg );
  }

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
    client.leave(payload._room_info._room_name);
    if (!this.server.adapter.rooms.has(payload._room_info._room_name)) {
      console.log(
        '\x1b[38;5;227m',
        'delete channel',
        '\x1b[38;5;46m',
        payload._room_info._room_name,
        '\x1b[0m',
      );
      channel_list.delete(payload._room_info._room_name);
      this.server.emit('room-refresh', this.ft_room_list());
    }
  }
}
