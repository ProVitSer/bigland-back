import { Inject, Injectable } from "@nestjs/common";
import axios, { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LogService } from "@app/logger/logger.service";
import { PlainObject } from "@app/mongo/types/interfaces";
import { LdsUserStatusResponse } from "./types/interfaces";

@Injectable()
export class AxiosService {
    private ldsConf = this.configService.get('lds');

    constructor(   
        private readonly logger: LogService,
        private httpService: HttpService,
        private readonly configService: ConfigService,
      ) {}

      public async getLSDUserStatus(): Promise<LdsUserStatusResponse>{
        try {
            const header = this.getLDSConfig()
            return (await this.httpService.get(this.ldsConf.url,header).toPromise()).data
        }catch(e){
            throw e;
        }
      }

      private getLDSConfig(): PlainObject{
        return {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.ldsConf.bearer}`,
                'Cookie': this.ldsConf.cookie
            }
        }
      }
}
