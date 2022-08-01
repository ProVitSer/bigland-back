import { CallInfoService } from '@app/callInfoQueue/callInfo.service';
import { LogService } from '@app/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsteriskAmiEventProviderInterface, AsteriskHungupEvent} from '../types/interfaces';
import { AsteriskCause, CallType } from '../types/types';

let checkCDR = true;

@Injectable()
export class HangupEventParser implements AsteriskAmiEventProviderInterface{
    constructor(
        private readonly log: LogService,
        private callQueue: CallInfoService        
    ) {
    }

    async parseEvent(event: AsteriskHungupEvent): Promise<void> {
        try {
            return await this.parseHungupEvent(event)
        }catch(e){
            this.log.error(String(event))
        }
    }

    private async parseHungupEvent(event: AsteriskHungupEvent): Promise<void> {
        if(checkCDR && event.calleridnum.toString().length < 4 &&
            event.uniqueid == event.linkedid &&
            event.connectedlinenum.toString().length > 4 &&
            [AsteriskCause.NORMAL_CLEARING, AsteriskCause.USER_BUSY, AsteriskCause.INTERWORKING].includes(event?.cause) &&
            event.connectedlinenum.toString() !== "<unknown>")
        {
            checkCDR = false;
            setTimeout(this.changeValueCDR,1000);
            this.log.info(`Исходящий ${event.uniqueid}`);
            await this.callQueue.runCallQueueJob('Outgoing',{ uniqueid: event.uniqueid, type: CallType.Outgoing});
        } 
        else if(checkCDR && event.calleridnum.toString().length < 4 &&
            event.connectedlinenum.toString().length > 4 &&
            event.cause == AsteriskCause.NORMAL_CLEARING
        ){
            checkCDR = false;
            setTimeout(this.changeValueCDR,1000);
            this.log.info(`Входящий ${event.linkedid}`);
            await this.callQueue.runCallQueueJob('Incoming',{ uniqueid: event.linkedid, type: CallType.Incoming});
        }
        else if(checkCDR && event.calleridnum.toString().length > 4 &&
            event.uniqueid == event.linkedid &&
            event.connectedlinenum.toString().length > 4 &&
            [AsteriskCause.NORMAL_CLEARING, AsteriskCause.USER_BUSY, AsteriskCause.INTERWORKING].includes(event?.cause) && 
            event.connectedlinenum.toString() !== "<unknown>")
        {
            checkCDR = false;
            setTimeout(this.changeValueCDR,1000);
            this.log.info(`Исходящий ${event.uniqueid}`);
            await this.callQueue.runCallQueueJob('Outgoing',{ uniqueid: event.uniqueid, type: CallType.Outgoing});
        } 
        else if(checkCDR && event.calleridnum.toString().length > 4 &&
            event.uniqueid == event.linkedid &&
            event.connectedlinenum.toString().length < 4 &&
            event.cause == AsteriskCause.NORMAL_CLEARING
        ){
            checkCDR = false;
            setTimeout(this.changeValueCDR,1000);
            this.log.info(`Входящий ${event.uniqueid}`);
            await this.callQueue.runCallQueueJob('Incoming',{ uniqueid: event.uniqueid, type: CallType.Incoming});
        }
    }

    private changeValueCDR(){
        checkCDR = true;
    }

}