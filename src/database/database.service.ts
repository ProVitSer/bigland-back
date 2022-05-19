import { LoggerService } from "../logger/logger.service";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Cdr } from "./entities/Cdr";
import { Op } from 'sequelize'
import { UtilsService } from "@app/utils/utils.service";


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

      const filterResult = resultFind.filter((cdr: Cdr) => cdr.disposition === "ANSWERED");
      const result = await Promise.all(filterResult.map( async (cdr: Cdr) => {
          if(UtilsService.isGsmChannel(cdr.dstchannel)){
            return await this.searchIncomingCallByLinkedid(cdr.uniqueid)
          } else {
            return cdr;
          }
      }));
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


    public async searchIncomingCallByLinkedid(uniqueid: string): Promise<Cdr> {
      try{
        this.logger.info(`Входящий вызов ${uniqueid}`)
        const resultFind  = await this.getCallInfo.findAll({
          raw: true,
          attributes: ["calldate", "src", "dcontext", "dstchannel", "billsec", "disposition", "uniqueid", "recordingfile"],
          where: {
              linkedid: {
                  [Op.like]: uniqueid
              }
          },
          order: [
              ['billsec', 'DESC'],
          ],
      });

      const result = resultFind.filter((cdr: Cdr) => UtilsService.checkDstChannel(cdr.dstchannel))
      this.logger.info(result);
      return result[0];
      }catch(e){
        this.logger.error(`searchIncomingCallByLinkedid ${e}`)
        return;
      }

    }
}
