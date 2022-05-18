import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {

    static replaceChannel(channel: string): string {
        return channel.replace(/(PJSIP\/)(\d{3})-(.*)/, `$2`);
    };

    static randomIntFromArray(items: Array<string>): string {
        return items[Math.floor(Math.random() * items.length)];
    };

    static generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    static sleep(ms: number): Promise<any> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
