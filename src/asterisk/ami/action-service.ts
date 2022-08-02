import { IDnd } from "@app/api/types/interfaces";
import { LogService } from "@app/logger/logger.service";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as namiLib from 'nami';
import { AmiService } from "../asterisk-ami.service";
import { AMIOUTBOUNDCALL } from "../config";
import { AsteriskDNDStatusResponse, AsteriskStatusResponse, dndStatusMap, EventsStatus, hintStatusMap } from "../types/interfaces";
import { ChannelType, DbFamilyType, statusHint } from "../types/types";


@Injectable()
export class ActionService {
    constructor(
        private readonly log: LogService,
        private readonly ami : AmiService, 
    ) {
    }
   
    public async sendAmiCall(localExtension: string, outgoingNumber: string): Promise<void> {
        try {
            this.log.info(`Исходящий вызов из webhook CRM: внутренний номер ${localExtension} внешний номер ${outgoingNumber}`);
            const action = new namiLib.Actions.Originate();
            action.channel = `${ChannelType.PJSIP}/${localExtension}`; 
            action.callerid = localExtension;
            action.priority = AMIOUTBOUNDCALL.priority;
            action.timeout = AMIOUTBOUNDCALL.timeout;
            action.context = AMIOUTBOUNDCALL.timeout;
            action.exten = outgoingNumber;
            action.async = AMIOUTBOUNDCALL.async;
            const resultInitCall : any = await this.ami.amiClientSend(action)
            this.log.info(`Результат инициации вызова ${resultInitCall}`);
        } catch(e){

        }
    }

    private async setHintStatus(extension: string, hint: statusHint): Promise<void>  {
        try {
            const action = new namiLib.Actions.Command();
            action.Command = `devstate change Custom:DND${extension} ${hint}`;
            return await this.ami.amiClientSend(action);
        } catch(e){

        }
    }


    public async setDNDStatus(data: IDnd): Promise<any>  {
        try {
            const extensionStatusList = {};

            await Promise.all(data.sip_id.map( async (sip_id: string) => {
    
                const checkExtension = await this.getDNDStatus(sip_id);
                if (checkExtension.response === 'Error'){
                    extensionStatusList[sip_id] = {status: 'error'}
                    return;
                }
                const resultSend: AsteriskStatusResponse = await this.dndPut(sip_id, data.dnd_status)
                this.log.info(resultSend);
                const hint = hintStatusMap[data.dnd_status]
    
                if(resultSend.response == 'Success'){
                    extensionStatusList[sip_id] = {status: 'success'}
    
                    return this.setHintStatus(sip_id, hint)
                } else {
                    return;
                }
            }))
    
            return extensionStatusList;
        }catch(e){
            
        }

    }

    private async dndPut(sipId: string, dndStatus: string): Promise<AsteriskStatusResponse> {
        const action = new namiLib.Actions.DbPut();
        action.Family = DbFamilyType.DND;
        action.Key = sipId;
        action.Val = dndStatusMap[dndStatus];
        return await this.ami.amiClientSend(action); 
    }


    private async getDNDStatus(extension: string): Promise<AsteriskDNDStatusResponse> {
        const action = new namiLib.Actions.DbGet();
        action.Family = DbFamilyType.DND;
        action.Key = extension;
        return await this.ami.amiClientSend(action);
    }

    public async getCallStatus(): Promise<AsteriskStatusResponse>{
        const action = new namiLib.Actions.Status();
        let callInfo: AsteriskStatusResponse = await this.ami.amiClientSend(action);
        return this.deleteNoUserProp(callInfo) as AsteriskStatusResponse
    }

    private deleteNoUserProp(callInfo: AsteriskStatusResponse): any {
        try{
            return callInfo.events.map( (event: EventsStatus) => {
                delete event.lines;
                delete event.EOL;
                delete event.variables;
                return event
            })
        } catch(e){
            this.log.error(e)
            return callInfo;
        }

    }
}