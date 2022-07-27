import { AmiService } from '@app/asterisk/asterisk-ami.service';
import { AxiosService } from '@app/axios/axios.service';
import { DatabaseService } from '@app/database/database.service';
import { LogService } from '@app/logger/logger.service';
import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, 
  SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';


@WebSocketGateway(7777, { transports: ['websocket'] })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect  {

  constructor(
    private readonly log: LogService,
    private readonly ami: AmiService,
    private readonly mongo: DatabaseService,
    private readonly  axios: AxiosService

  ){
    console.log('Notification service started on port 8080');
  }
  
  @WebSocketServer()
  server: Server;
  wsClients: WebSocket[] = [];

  @SubscribeMessage('get-infoList')
  getInfoList(client: any, payload: any): any {
    console.log(JSON.stringify(client))
    console.log(JSON.stringify(payload))

  }

  @SubscribeMessage('transfer')
  tarsferCall(client: any, payload: any): any {
    console.log(JSON.stringify(client))
    console.log(JSON.stringify(payload))

  }

  @SubscribeMessage('dnd')
  setDNDStatus(client: any, payload: any): any {
    console.log(JSON.stringify(client))
    console.log(JSON.stringify(payload))

  }

  @SubscribeMessage('customdnd')
  setCustomDNDStatus(client: any, payload: any): any {
    console.log(JSON.stringify(client))
    console.log(JSON.stringify(payload))

  }
  

  public afterInit() {
    console.log('wss initialized');
  }

  public handleConnection(client: WebSocket, ...args: any[]){
    console.log(`Подключился новый пользователь ${client}`)

    this.wsClients.push(client)
    this.log.info(`Подключился новый пользователь ${client}`)
  }

  public handleDisconnect(client: WebSocket){
    console.log(`Отключился пользователь ${client}`)
  }

  public async broadcast(event: any, message: any) {
    const broadCastMessage = JSON.stringify(message);
    for (let client of this.wsClients) {
        await (client as any).send({event: event, message: broadCastMessage});
    }
  }
  
}
