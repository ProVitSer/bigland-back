import { AmiService } from '@app/asterisk/asterisk-ami.service';
import { AuthService } from '@app/auth/auth.service';
import { GsmGatewayService, sendSMSInfo } from '@app/gsm-gateway/gsm-gateway.service';
import { LoggerService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmocrmDto } from './dto/amocrm.dto';
import { DNDDto } from './dto/dnd.dto';
import { IDnd, ISmsData } from './types/interfaces';

@Injectable()
export class ApiService {
    constructor(
        private readonly ami: AmiService,
        private readonly log: LoggerService,
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
}
