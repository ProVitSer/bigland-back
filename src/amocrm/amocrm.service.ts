import { Injectable, LoggerService, OnApplicationBootstrap } from '@nestjs/common';
import { AmocrmConnector } from './amocrm.connect';
import { amocrmAPI, AmocrmContact, AmocrmGetContactsResponse, httpMethod } from './types/interfaces';

@Injectable()
export class AmocrmService implements OnApplicationBootstrap {

    public amocrm: any

    constructor(
        private readonly amocrmConnect: AmocrmConnector,
        private readonly logger: LoggerService

    ) {
    }

    public async onApplicationBootstrap() {
        this.amocrm = await this.connect()
    }

    public async searchContact(){
        try {
            const result: AmocrmGetContactsResponse = (await this.amocrm.request.get(amocrmAPI.contacts, {
                query: '+79104061420'
            }))?.data;
        } catch(e){
            console.log(e)

        }

    }

    private async connect() {
        return await this.amocrmConnect.connect();
    }

}
