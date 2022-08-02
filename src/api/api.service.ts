import { ActionService } from '@app/asterisk/ami/action-service';
import { AmiService } from '@app/asterisk/asterisk-ami.service';
import { AriService } from '@app/asterisk/asterisk-ari.service';
import { AuthService } from '@app/auth/auth.service';
import { GsmGatewayService, sendSMSInfo } from '@app/gsm-gateway/gsm-gateway.service';
import { LogService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmocrmDto } from './dto/amocrm.dto';
import { DNDDto } from './dto/dnd.dto';
import { IDnd, ISmsData, MonitoringCall, MonitoringCallResult } from './types/interfaces';

@Injectable()
export class ApiService {
    constructor(
        private readonly ami: ActionService,
        private readonly ari: AriService,
        private readonly log: LogService,
        private readonly gms: GsmGatewayService,
    ){}

    public async setDndStatus(data: IDnd): Promise<any>{
      try {
        return await this.ami.setDNDStatus(data);
      }catch(e){
        throw e;
      }
    }

    public async sendSms(data: ISmsData): Promise<any> {
      try{
        const smsInfo: sendSMSInfo = {
          mobileNumber: data.number,
          smsText: data.text
        }
        return await this.gms.sendSms(smsInfo)
      }catch(e){

      }

    }

    public async amocrmWidget(query: AmocrmDto): Promise<any> {
      try {
        switch (query._action) {
          case "call":
            this.log.info(console.log('Запросы вызова из Amocrm', query._action));
            await this.ami.sendAmiCall(query.from, query.to,)
            return {}
        case "status":
          const callIfo = await this.ami.getCallStatus();
          let sendStatus = {
            "status": "ok",
            "action": query._action,
            "data": callIfo[0]
          };
          return "asterisk_cb(" + JSON.stringify(sendStatus) + ");"
        case "cdr":
          return {}
        default:
            this.log.error(`Ошибка запроса ${query._action}`);
            this.log.error(`Ошибка запроса ${query}`);
            throw  new Error("Ошибка запроса")
        }
      }catch(e){
        throw e;
      }
    }

    public async sendMonitoringCall(data: MonitoringCall): Promise<MonitoringCallResult[]>{
      try {
        const result: MonitoringCallResult[] = []
        await Promise.all( data.numbers.map(async (number: string) => {
          const callResult = await this.ari.ariOutboundCall(number);
          result.push({
            number,
            isCallSuccessful: true
          })
        }))
        return result; 
      }catch(e){
        throw e;
      }

    }
}
