import { AmocrmService } from "@app/amocrm/amocrm.service";
import { LogService } from "@app/logger/logger.service";
import { MongoService } from "@app/mongo/mongo.service";
import { CollectionType, DbRequestType } from "@app/mongo/types/types";
import { Injectable } from "@nestjs/common";
import { AsteriskAmiEventProviderInterface, AsteriskBlindTransferEvent, AsteriskUnionEvent } from "../types/interfaces";


@Injectable()
export class BlindTransferEventParser implements AsteriskAmiEventProviderInterface{
    constructor(
        private readonly log: LogService,
        private readonly amocrm: AmocrmService,
        private readonly mongo: MongoService,  
    ) {
    }

    async parseEvent(event: AsteriskBlindTransferEvent): Promise<void> {
        try {
            return await this.parseBlindTransferEvent(event)
        }catch(e){
            this.log.error(String(event))
        }    
    }

    private async parseBlindTransferEvent(event: AsteriskBlindTransferEvent){
        try {
            if(!!event.extension && event.extension.toString().length == 3 && event.transfererconnectedlinenum.toString().length >= 10){
                const params = {
                    criteria: {
                      "localExtension": event.extension
                    },
                    entity: CollectionType.amocrmUsers,
                    requestType: DbRequestType.findAll
                  };
                const resultSearchId = await this.mongo.mongoRequest(params);
                (!!resultSearchId[0]?.amocrmId) ? await this.amocrm.incomingCallEvent( event.transfererconnectedlinenum, String(resultSearchId[0]?.amocrmId )) : '';
            }

        } catch(e){
            throw e;
        }
    }
}