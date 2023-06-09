import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'chat', cors: true })
export class ChatGateway implements 
	OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Namespace;

  afterInit(server: Server) {
	  console.count('Init');
	  this.server.server.engine.opts.pingTimeout = 20000;
	  this.server.server.engine.opts.pingInterval = 20000;
	  this.server.server.engine.opts.upgradeTimeout = 20000;
  }
  handleConnection(@ConnectedSocket() client: Socket, ...args: any[])
  {
	  client.join("defult");
	  client.leave(client.id);
	  console.log('connect');
	  console.log(client.id);
  }
  
  handleDisconnect(@ConnectedSocket() client: Socket)
  {
	  console.log('disconnect');
	  console.log(client.id);
  }

}
