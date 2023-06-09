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
import { ChatRoomDTO } from './dto/chat.dto';

let	channel_list = new Map <string, ChatRoomDTO>();


@WebSocketGateway({ namespace: 'chat', cors: true })
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
   * @emits server => "room-list"
   * @brief 방 리스트 목록 조회
   */
  @SubscribeMessage('room-refresh')
  ft_room_refresh(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: string,
  ) {
    client.emit('room-refresh', this.ft_room_list());
  }

  /**
   * @name ft_room_create
   * @param client
   * @param payload
   * @emits server
   * @brief 방 생성시 실행
   */
  @SubscribeMessage('room-create')
  ft_room_create(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatRoomDTO,
  ) {
	if (this.server.adapter.rooms.has(payload.room_name))
	{
		client.emit('room-create', {});
		return ;
	}
    client.join(payload.room_name);
	channel_list.set(payload.room_name, payload);
    console.log(channel_list);
	client.emit('room-create', payload);
    this.server.emit('room-refresh', this.ft_room_list());
  }

  /**
   * @name ft_room_list
   * @returns room_list : ChatRoomDto []
   * @brief 방 모든 목록을 가져온다
   */
  ft_room_list(): ChatRoomDTO [] {
    let room_list: ChatRoomDTO [] = [];
    channel_list.forEach((val, key) => {
      room_list.push(val);
    });
    return room_list;
  }
}
