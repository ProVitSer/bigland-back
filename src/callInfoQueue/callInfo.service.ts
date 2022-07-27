import { Injectable, } from '@nestjs/common';
import { LogService } from "../logger/logger.service";
import Bull, { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { AsteriskHungupEvent, CallType } from '@app/asterisk/types/interfaces';
import { PlainObject } from '@app/asterisk/asterisk-ari.service';

@Injectable()
export class CallInfoService {
    private readonly log: LogService;

    constructor(@InjectQueue('callInfo') private callQueue: Queue) { }

    public async runCallQueueJob( type: string ,event: PlainObject): Promise<Bull.JobId> {
        try{
            const result = await this.addToCallQueue(type, event);
            return result;
        }catch(e){
            this.log.error(`Проблемы с добавлением события в очередь ${e}`);
        }
    }

    private async addToCallQueue(type: string , event: PlainObject): Promise<Bull.JobId> {
        try{
            const result =  await this.callQueue.add(type, event, { attempts: 5, removeOnComplete: true, delay: 40000, backoff: 10000 });
            return result.id
        }catch(e){
            this.log.error(`Проблемы с добавлением события в очередь ${e}`);

        }
    }
}
