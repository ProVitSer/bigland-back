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


  @Processor('callInfo')
  export class CallInfoConsumer {
    private readonly logger: LoggerService;
  
    @Process('Outgoing')
    public async outgoingCallJob(job: Job<any>): Promise<any> {
        console.log(`@Process('Outgoing') ${job}`)

    }

    @Process('Incoming')
    public async incomingCallJob(job: Job<any>): Promise<any> {
        console.log(`@Process('Incoming') ${job}`)
    }

    @OnQueueActive()
    onActive(job: Job): void {
        console.log(`onActive job ${job.id} of type ${job.name}...`);
    }

    @OnQueueWaiting()
    onWaiting(job: Job): void {
        console.log(`onWaiting job ${job.id} of type ${job.name}...`);
    }

    @OnQueueError()
    onError(job: Job): void {
        console.log(`onError job ${job.id} of type ${job.name}...`);
    }

    @OnQueueFailed()
    onFailed(job: Job): void {
        console.log(`onFailed job ${job.id} of type ${job.name}...`);
    }
  
  }