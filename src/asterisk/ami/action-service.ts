import { LogService } from "@app/logger/logger.service";
import { Inject, Injectable, OnApplicationBootstrap, OnModuleInit } from "@nestjs/common";
import * as namiLib from 'nami';
import { AmiService } from "../asterisk-ami.service";


@Injectable()
export class ActionService implements OnApplicationBootstrap{
    constructor(
        private readonly log: LogService,
        private readonly amiService : AmiService, 
    ) {
    }
    async onApplicationBootstrap() {
        try {
            const client = await this.amiService.amiClient;

            console.log('onApplicationBootstrap', client)
            const action = new namiLib.Actions.Status();
            let callInfo = await new Promise((resolve) =>{
                client.send(action, (event: any) => {
                    resolve(event);
                });
            });
            console.log(callInfo)
        } catch(e){
            console.log(e)

        }

    }
}