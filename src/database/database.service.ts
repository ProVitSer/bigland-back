import { LoggerService } from "../logger/logger.service";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Cdr } from "./entities/Cdr";
import { Op as $ } from 'sequelize'


@Injectable()
export class DatabaseService {
    constructor(
      @InjectModel(Cdr)
      private cdr: typeof Cdr,
      private readonly logger : LoggerService, 
    ) {}

    public async searchIncomingCallInfoInCdr(uniqueid: string): Promise<Cdr[]> {
      try{
        this.logger.info(`Входящий вызов ${uniqueid}`)

        const result  = await this.cdr.findAll({
          raw: true,
          attributes: ["calldate", "src", "dcontext", "dstchannel", "billsec", "disposition", "uniqueid", "recordingfile"],
          where: {
              uniqueid: {
                  [$.like]: uniqueid
              }
          },
          order: [
              ['billsec', 'DESC'],
          ],
          limit: 1
      });

      this.logger.info(`Результат выгрузки по входящему вызову ${result}`)
      if(result.length !== 0){
        return null;
      } else {
        return result;
      }
      }catch(e){
        this.logger.error(`searchIncomingCallInfoInCdr ${e}`)
      }

    }

    async searchOutgoingCallInfoInCdr(uniqueid: string): Promise<Cdr> {
      try{
        this.logger.info(`Исходящий вызов ${uniqueid}`)

        const result  = await this.cdr.findAll({
          raw: true,
          attributes: ["calldate", "dst", "channel", "dcontext", "billsec", "disposition", "uniqueid", "recordingfile"],
          where: {
              uniqueid: {
                  [$.like]: uniqueid
              },
              dcontext: {
                  [$.like]: 'from-internal'
              }
          }
        });

        this.logger.info(`Результат выгрузки по исходящему вызову ${result}`)

        if(result[0]){
            return result[0];
        } else {
            return null;
        }
      }catch(e){
        this.logger.error(`searchOutgoingCallInfoInCdr ${e}`)
      }
    }
}
