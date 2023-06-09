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
    client.emit('room-list', this.ft_room_list());
  }

  /**
   * @name ft_room_list
   * @returns room_list : string []
   * @brief 방 모든 목록을 가져온다
   */
  ft_room_list(): string[] {
    let room_list: string[] = [];
    this.server.adapter.rooms.forEach((val, key, map) => {
      console.log(val, key);
      room_list.push(key);
    });
    return room_list;
  }
}
