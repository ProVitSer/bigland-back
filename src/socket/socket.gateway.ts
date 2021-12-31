import { AmiService } from '@app/asterisk/asterisk-ami.service';
import { AxiosService } from '@app/axios/axios.service';
import { DatabaseService } from '@app/database/database.service';
import { LoggerService } from '@app/logger/logger.service';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import io from 'socket.io'
import { Server, WebSocket } from 'ws';

@WebSocketGateway(7777)
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect  {

  constructor(
    private readonly log: LoggerService,
    private readonly ami: AmiService,
    private readonly mondo: DatabaseService,
    private readonly  axios: AxiosService

  ){}
  
  @WebSocketServer()
  server: Server;
  wsClients: WebSocket[] = [];

  @SubscribeMessage('get-infoList')
  getInfoList(client: any, payload: any): any {

  }

  @SubscribeMessage('transfer')
  tarsferCall(client: any, payload: any): any {

  }

  @SubscribeMessage('dnd')
  setDNDStatus(client: any, payload: any): any {

  }

  @SubscribeMessage('customdnd')
  setCustomDNDStatus(client: any, payload: any): any {

  }
  


  public handleConnection(client: WebSocket, ...args: any[]){
    this.wsClients.push(client)
    this.log.info(`Подключился новый пользователь ${client}`)
  }

  public handleDisconnect(client: io.Socket){
    this.log.info(`Отключился пользователь ${client}`)
  }

  private Broadcast(event: any, message: any) {
    const broadCastMessage = JSON.stringify(message);
    for (let client of this.wsClients) {
        (client as any).emit(event, broadCastMessage);
    }
  }
  
}
