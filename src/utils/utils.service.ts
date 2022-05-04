import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {

    static replaceChannel(channel: string){
        return channel.replace(/(PJSIP\/)(\d{3})-(.*)/, `$2`);
    };

    static randomIntFromArray(items: Array<string>) {
        return items[Math.floor(Math.random() * items.length)];
    };
}
