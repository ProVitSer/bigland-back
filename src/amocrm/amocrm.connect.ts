import { Inject, Injectable, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { writeFile, readFile, access } from 'fs/promises'
import { constants } from 'fs';
import * as path from 'path';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { LoggerService } from '@app/logger/logger.service';
import { amocrmAPI, AmocrmTokenResponse, httpMethod } from './types/interfaces';

@Injectable()
export class AmocrmConnector implements OnApplicationBootstrap{

    public amocrmClient: any;


    constructor(
        @Inject('Amocrm') private readonly amocrm: any,
        private readonly configService: ConfigService,
        private readonly logger: LoggerService

    ) {
    }

    public async onApplicationBootstrap() {
        try {
            this.logger.info('Init Amocrm')
            this.amocrmClient = this.amocrm;
            const currentToken = await this.getConfigToken();
            await this.amocrmClient.connection.setToken(currentToken);
            await this.log();
            const response = await this.amocrmClient.request(httpMethod.get, amocrmAPI.account);
            if(!response.data.hasOwnProperty('id')){
                this.logger.error('Init Amocrm error', response)
                throw Error;
            };
            this.logger.info('Init Amocrm successfully')
        } catch (e) {
            this.logger.error(e);
        }

    };

    public async connect(){
        return this.amocrmClient;
    }

    private async getConfigToken() {//: AmocrmTokenResponse {
        try{
            const isFileExist = await this.isAccessible(path.join(__dirname, this.configService.get('amocrm.tokenPath')));
            if(!isFileExist){
                await this.amocrmAuth();
            };
            const token = await readFile(path.join(__dirname, this.configService.get('amocrm.tokenPath')));
            return JSON.parse(token.toString());
        }catch(e){
            this.logger.error(e);
        }
    }

    private async isAccessible(path: string): Promise<boolean> {
        return access(path)
            .then(() => true)
            .catch(() => false);
    }

    public async amocrmAuth() : Promise<void>{
        try{
            const authUrl = await this.amocrmClient.connection.getAuthUrl();
            console.log('Вам нужно перейти по ссылке и выдать права на аккаунт, а после перезагрузить приложение', authUrl);
            const response = await this.amocrmClient.request('GET', '/api/v4/account');
            const tokenInit : AmocrmTokenResponse = await this.amocrmClient.connection.getToken();
            await writeFile(path.join(__dirname, this.configService.get('amocrm.tokenPath')), JSON.stringify(tokenInit));
            return;
        }catch(e){
            console.log('e',e)
        }

    }

    private async refreshToken(): Promise<void> {
        const token: AmocrmTokenResponse = (await this.amocrmClient.connection.refreshToken()).data;
        return await writeFile(path.join(__dirname, this.configService.get('amocrm.tokenPath')), JSON.stringify(token));
    }

    private async log(): Promise<void>{
        this.amocrmClient.on('connection:beforeConnect', async (error: any) => {
            this.logger.info('connection:beforeConnect',error)
            await this.refreshToken();
        });

        this.amocrmClient.on('connection:newToken', async  (response : any) => {
            this.logger.info('connection:newToken',response);
            await writeFile(path.join(__dirname, this.configService.get('amocrm.tokenPath')), JSON.stringify(response.data));

        });

        this.amocrmClient.on('connection:authError', async (error: any) => {
            this.logger.error('connection:authError',error);
            await this.refreshToken();
        });

        this.amocrmClient.on('connection:error', (error: any) => {
            this.logger.error('connection:error',error)
        });

        this.amocrmClient.on('connection:beforeRefreshToken', (response : any) => {
            this.logger.info('connection:beforeRefreshToken', response)
        });

        return;
    }

}
