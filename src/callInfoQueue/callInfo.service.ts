import { Injectable, } from '@nestjs/common';
import { LoggerService } from "../logger/logger.service";
import Bull, { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { AsteriskHungupEvent, CallType } from '@app/asterisk/types/interfaces';
import { PlainObject } from '@app/asterisk/asterisk-ari.service';

@Injectable()
export class CallInfoService {
    private readonly log: LoggerService;

    constructor(@InjectQueue('callInfo') private callQueue: Queue) { }

    public async runCallQueueJob( type: string ,event: PlainObject): Promise<Bull.JobId> {
        try{
            const result = await this.addToCallQueue(type, event);
            console.log(`Добавили в очередь на обработку ${result}`);
            return result;
        }catch(e){
            console.log(`Проблемы с добавлением события в очередь ${e}`);
        }
    }

    private async addToCallQueue(type: string , event: PlainObject): Promise<Bull.JobId> {
        try{
            const result =  await this.callQueue.add(type, event, { removeOnComplete: true, delay: 30000 });
            console.log(result)
            return result.id
        }catch(e){
            console.log(`Проблемы с добавлением события в очередь ${e}`);

        }
    }
}
