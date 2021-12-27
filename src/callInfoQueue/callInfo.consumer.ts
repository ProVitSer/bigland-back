import { DatabaseService } from '../database/database.service';
import {
    OnQueueActive,
    OnQueueCompleted,
    OnQueueError,
    OnQueueFailed,
    OnQueueWaiting,
    Process,
    Processor,
  } from '@nestjs/bull';
import { Job } from 'bull';
import { LoggerService } from "../logger/logger.service";
import { MongoService } from '@app/mongo/mongo.service';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { UtilsService } from '@app/utils/utils.service';


  @Processor('callInfo')
  export class CallInfoConsumer {

    constructor(
        private readonly logger: LoggerService,
        private mysql: DatabaseService,
        private mongo: MongoService,
        private utils: UtilsService
      ) {}

    @Process('Outgoing')
    public async outgoingCallJob(job: Job<any>): Promise<any> {
        try{
            const result = await this.mysql.searchOutgoingCallInfoInCdr(job.data.uniqueid);
            const amocrmId = await this.getAmocrmId(this.utils.replaceChannel(result.channel))
        }catch(e){
            this.logger.error(e);
        }

    }

    @Process('Incoming')
    public async incomingCallJob(job: Job<any>): Promise<any> {
        try{
          const result = await this.mysql.searchIncomingCallInfoInCdr(job.data.uniqueid);
          const amocrmId = await this.getAmocrmId(this.utils.replaceChannel(result[0].channel))
        }catch(e){
            this.logger.error(e);
        }

    }

    private async getAmocrmId(localExtension: string): Promise<any>{
      const params = {
        criteria: {
          "localExtension": localExtension
        },
        entity: CollectionType.amocrmUsers,
        requestType: DbRequestType.findAll
      };
      return await this.mongo.mongoRequest(params);
    }

    // @OnQueueActive()
    // onActive(job: Job): void {
    //     console.log(`onActive job ${job.id} of type ${job.name}...`);
    // }

    // @OnQueueWaiting()
    // onWaiting(job: Job): void {
    //     console.log(`onWaiting job ${job.id} of type ${job.name}...`);
    // }

    // @OnQueueError()
    // onError(job: Job): void {
    //     console.log(`onError job ${job.id} of type ${job.name}...`);
    // }

    // @OnQueueFailed()
    // onFailed(job: Job): void {
    //     console.log(`onFailed job ${job.id} of type ${job.name}...`);
    // }
  
  }