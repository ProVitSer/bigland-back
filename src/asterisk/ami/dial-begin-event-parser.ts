import { AmocrmService } from "@app/amocrm/amocrm.service";
import { LogService } from "@app/logger/logger.service";
import { MongoService } from "@app/mongo/mongo.service";
import { CollectionType, DbRequestType } from "@app/mongo/types/types";
import { Injectable } from "@nestjs/common";
import { AsteriskAmiEventProviderInterface, AsteriskDialBeginEvent } from "../types/interfaces";


@Injectable()
export class DialBeginEventParser implements AsteriskAmiEventProviderInterface{
    constructor(
        private readonly log: LogService,
        private readonly amocrm: AmocrmService,
        private readonly mongo: MongoService,   
    ) {
    }

    async parseEvent(event: AsteriskDialBeginEvent): Promise<void> {
        try {
            return await this.parseDialBeginEvent(event)
        }catch(e){
            this.log.error(String(event))
        }    
    }

    private async parseDialBeginEvent(event: AsteriskDialBeginEvent){
        try {
            if(!!event.destcalleridnum && event.destcalleridnum.toString().length == 3 && event.calleridnum.toString().length >= 10 ){
                const params = {
                    criteria: {
                      "localExtension": event.destcalleridnum
                    },
                    entity: CollectionType.amocrmUsers,
                    requestType: DbRequestType.findAll
                  };
                const resultSearchId = await this.mongo.mongoRequest(params);
                (!!resultSearchId[0]?.amocrmId) ? await this.amocrm.incomingCallEvent( event.calleridnum, String(resultSearchId[0]?.amocrmId )) : '';
            }
        } catch(e){
            throw e;
        }
    }
}