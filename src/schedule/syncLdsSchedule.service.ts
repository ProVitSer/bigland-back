import { AxiosService } from '@app/axios/axios.service';
import { Item, LdsUserStatusResponse } from '@app/axios/types/interfaces';
import { LoggerService } from '@app/logger/logger.service';
import { MongoService } from '@app/mongo/mongo.service';
import { AmocrmUsers, LdsUsersStatus } from '@app/mongo/schemas';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class SyncLDSScheduleService implements OnApplicationBootstrap {
    
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: LoggerService,
        private readonly axios: AxiosService,
        private readonly mongo : MongoService
      ) {}

    onApplicationBootstrap() {}

    @Cron(CronExpression.EVERY_DAY_AT_6PM)
    async updateLdsUserStatus() {
        try{
            const result = await this.axios.getLSDUserStatus();
            await this.mongo.mongoRequest({criteria: {},entity: CollectionType.ldsUserStatus,requestType: DbRequestType.deleteMany});
            await Promise.all(result.items.map(async (item:Item) => {
                await this.mongo.mongoRequest({
                    criteria: {},
                    entity: CollectionType.ldsUserStatus,
                    requestType: DbRequestType.insertMany,
                    data: item});
            }))
        }catch(e){
            this.logger.error(`updateLDSUserStatus ${e}`)
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_7PM)
    async updateAmocrmUsers() {
        try{
            const formatLdsUsers : AmocrmUsers[] = [];
            await this.mongo.mongoRequest({criteria: {},entity: CollectionType.amocrmUsers,requestType: DbRequestType.deleteMany});
            const ldsUsers: LdsUsersStatus[] = await this.mongo.mongoRequest({criteria: {},entity: CollectionType.ldsUserStatus,requestType: DbRequestType.findAll});
            ldsUsers.map((ldsUser: LdsUsersStatus) => {
                if(ldsUser.sip_id !== null){
                    formatLdsUsers.push({
                        localExtension: ldsUser.sip_id ,
                        amocrmId: ldsUser.amo[0].amo_id
                    })
                }
            })
            await Promise.all(formatLdsUsers.map(async (formatLdsUser: AmocrmUsers) => {
                await this.mongo.mongoRequest({criteria: {},entity: CollectionType.amocrmUsers,requestType: DbRequestType.insertMany, data: formatLdsUser});
            }))
        }catch(e){
            this.logger.error(`updateAmocrmUsers ${e}`)
        }
    }
}
