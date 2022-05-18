import { LoggerService } from "../logger/logger.service";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Cdr } from "./entities/Cdr";
import { Op } from 'sequelize'


@Injectable()
export class DatabaseService {
    constructor(
      @InjectModel(Cdr)
      private getCallInfo: typeof Cdr,
      private readonly logger : LoggerService, 
    ) {}

    public async searchIncomingCallInfoInCdr(uniqueid: string): Promise<Cdr[]> {
      try{
        this.logger.info(`Входящий вызов ${uniqueid}`)
        const resultFind  = await this.getCallInfo.findAll({
          raw: true,
          attributes: ["calldate", "src", "dcontext", "dstchannel", "billsec", "disposition", "uniqueid", "recordingfile"],
          where: {
              uniqueid: {
                  [Op.like]: uniqueid
              }
          },
          order: [
              ['billsec', 'DESC'],
          ],
          //limit: 1
      });

      const result = resultFind.filter((cdr: Cdr) => cdr.disposition === "ANSWERED")
      this.logger.info(result);
      return result;
      }catch(e){
        this.logger.error(`searchIncomingCallInfoInCdr ${e}`)
        return;
      }

    }

    public async searchOutgoingCallInfoInCdr(uniqueid: string): Promise<Cdr> {
      try{
        this.logger.info(`Исходящий вызов ${uniqueid}`)

        const result  = await this.getCallInfo.findAll({
          raw: true,
          attributes: ["calldate", "dst", "channel", "dcontext", "billsec", "disposition", "uniqueid", "recordingfile"],
          where: {
              uniqueid: {
                  [Op.like]: uniqueid
              },
              dcontext: {
                  [Op.like]: 'from-internal'
              }
          }
        });

        this.logger.info(result);

        if(result.length !== 0){
          return result[0];
        } else {
          return result[0]
        }
      }catch(e){
        this.logger.error(`searchOutgoingCallInfoInCdr ${e}`)
        return;
      }
    }
}
