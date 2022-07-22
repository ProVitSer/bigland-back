import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {

    static replaceChannel(channel: string): string {
        return channel.replace(/(PJSIP\/)(\d{3})-(.*)/, `$2`);
    };

    static checkDstChannel(str: string): boolean {
        const regexp = new RegExp('^PJSIP\/[0-9][0-9][0-9]-.*$'); 
        return regexp.test(str)
    }

    static isGsmChannel(str: string): boolean{
        const regexp = new RegExp('^PJSIP\/Zadarma-.*$'); 
        return regexp.test(str)
    }

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
