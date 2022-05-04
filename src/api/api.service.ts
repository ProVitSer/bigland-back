import { AmiService } from '@app/asterisk/asterisk-ami.service';
import { AuthService } from '@app/auth/auth.service';
import { LoggerService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AmocrmDto } from './dto/amocrm.dto';

@Injectable()
export class ApiService {
    constructor(
        private readonly ami: AmiService,
        private readonly auth: AuthService,
        private readonly log: LoggerService,
        private readonly config: ConfigService

    ){}


    public async amocrmWidget(query: AmocrmDto): Promise<any>{
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
    }
}
