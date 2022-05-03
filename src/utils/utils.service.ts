import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {

    replaceChannel(channel: string){
        return channel.replace(/(PJSIP\/)(\d{3})-(.*)/, `$2`);
    };

}
