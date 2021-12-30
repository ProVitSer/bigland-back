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
import Bull from 'bull';
import { LoggerService } from "../logger/logger.service";
import { MongoService } from '@app/mongo/mongo.service';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { UtilsService } from '@app/utils/utils.service';
import { AmocrmService } from '@app/amocrm/amocrm.service';
import { directionType } from '@app/amocrm/types/interfaces';


  @Processor('callInfo')
  export class CallInfoProcessor {

    constructor(
        private readonly logger: LoggerService,
        private mysql: DatabaseService,
        private mongo: MongoService,
        private utils: UtilsService,
        private amocrm: AmocrmService
      ) {}

    @Process('Outgoing')
    public async outgoingCallJob(job: Bull.Job<any>, done: Bull.DoneCallback): Promise<any> {
        try{
          const result = await this.mysql.searchOutgoingCallInfoInCdr(job.data.uniqueid);
          const resultSearchId = await this.getAmocrmId(this.utils.replaceChannel(result.channel));
          const jobProgress =  await this.amocrm.sendCallInfoToCRM(result,resultSearchId[0]?.amocrmId,directionType.outbound);
          (jobProgress instanceof Error)?done(jobProgress): done();
        }catch(e){
            this.logger.error(`outgoingCallJob ${e}`);
        }

    }

    @Process('Incoming')
    public async incomingCallJob(job: Bull.Job<any>, done: Bull.DoneCallback): Promise<any> {
        try{
          const result = await this.mysql.searchIncomingCallInfoInCdr(job.data.uniqueid);
          const resultSearchId = await this.getAmocrmId(this.utils.replaceChannel(result[0].dstchannel));
          const jobProgress = await this.amocrm.sendCallInfoToCRM(result[0],resultSearchId[0]?.amocrmId,directionType.inbound);
          (jobProgress instanceof Error)?done(jobProgress): done();
        }catch(e){
            this.logger.error(`incomingCallJob ${e}`);
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

    @OnQueueError()
    onError(job: Job): void {
      this.logger.error(`OnQueueError ${JSON.stringify(job)}`);
    }

    @OnQueueFailed()
    onFailed(job: Job): void {
      if(job.attemptsMade === 5){
        this.logger.error(`Job data ${JSON.stringify(job.data)} error ${JSON.stringify(job.stacktrace)}`);
      }
    }
  
    @OnQueueCompleted()	
    onCompleted(job: Job): void {
      this.logger.info(`onCompleted ${JSON.stringify(job)}`);
    }
  }