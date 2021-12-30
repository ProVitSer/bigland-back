import { LoggerService } from '@app/logger/logger.service';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AmocrmConnector } from './amocrm.connect';
import { AmocrmAddCallInfo, AmocrmAddCallInfoResponse, amocrmAPI, AmocrmContact, AmocrmCreateContact, AmocrmCreateContactResponse, AmocrmCreateLead, AmocrmCreateLeadResponse, AmocrmGetContactsRequest, 
    AmocrmGetContactsResponse, directionType, httpMethod } from './types/interfaces';
import { callStatuskMap, numberDescriptionkMap, RecordPathFormat, sipTrunkMap } from './config';
import { operatorCIDNumber, responsibleUserId } from '../config/config'; 
import * as moment from 'moment';
import { Cdr } from '@app/database/entities/Cdr';
import { PlainObject } from '@app/mongo/types/interfaces';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AmocrmService implements OnApplicationBootstrap {

    public amocrm: any;
    private readonly recordDomain = this.configService.get('customConf.recordDomain')

    constructor(
        private readonly amocrmConnect: AmocrmConnector,
        private readonly logger: LoggerService,
        private readonly configService: ConfigService,

    ) {
    }

    public async onApplicationBootstrap() {
        this.amocrm = await this.connect();
    }


    public async actionsInAmocrm(incomingNumber: string , incomingTrunk: operatorCIDNumber): Promise<void>{
        try {
            const resultSearchContact = await this.searchContact(incomingNumber);
            if (resultSearchContact == false) {
                const idCreateContact = await this.createContact(incomingNumber, incomingTrunk);
                await this.createLeads(incomingNumber, incomingTrunk, idCreateContact);
            }
        } catch(e){
            this.logger.error(`Ошибка взаимодействия с Amocrm по Лидам,Контактам ${e}`);
        }
    }

    public async sendCallInfoToCRM(result: Cdr, amocrmId : number,  direction : directionType) {
        try {
            const { uniqueid, src, dst, calldate, billsec, disposition, recordingfile } = result;

            const callInfo : AmocrmAddCallInfo = {
                "direction": direction,
                "uniq": uniqueid,
                "duration": billsec,
                "source": "amo_custom_widget",
                "link": `${this.recordDomain}/rec/monitor/${moment().format(RecordPathFormat)}/${recordingfile}`,
                "phone": (src !== undefined)? src : dst,
                "call_result": "",
                "call_status": callStatuskMap[disposition],
                "responsible_user_id": amocrmId,
                "created_by": amocrmId,
                "updated_by": amocrmId,
                "created_at": moment(calldate).unix(),
                "updated_at": moment(calldate).unix(),
            }

            this.logger.info(callInfo);
            const resultSendCallIfo = (await this.amocrm.request.post(amocrmAPI.call, [callInfo]));
            if([400,401].includes(resultSendCallIfo.statusCode)){
                this.logger.error(resultSendCallIfo.data['validation-errors'][0].errors);
                throw Error(resultSendCallIfo.data['validation-errors'][0].errors)
            } else {
                this.logger.error(resultSendCallIfo.data);
                return this.validationErrors(resultSendCallIfo.data);
            }
        } catch(e){
            throw e;
        }
    }

    private validationErrors(response: PlainObject): boolean| Error {
       return (response._total_items === 1)? true : Error();
    }

    public async sendIncomingCallEvent(incomingNumber, responsibleUserId) {}

    public async searchContact(incomingNumber: string): Promise<boolean>{
        try {
            const info: AmocrmGetContactsRequest = {
                query: incomingNumber
            }
            const result: AmocrmGetContactsResponse = (await this.amocrm.request.get(amocrmAPI.contacts, info))?.data;
            this.logger.info(`Результат поиска контакта ${incomingNumber}: ${result}`);
            return (Object.keys(result).length == 0)? false : true;
        } catch(e){
            this.logger.error(`searchContact ${incomingNumber} ${e}`);
            throw e;
        }

    }

    private async createContact(incomingNumber: string, incomingTrunk: operatorCIDNumber): Promise<number> {
        try {
            const responsibleUserId = this.getResponsibleUserId();
            const contact: AmocrmCreateContact = {
                name: `Новый клиент ${incomingNumber}`,
                    responsible_user_id: Number(responsibleUserId),
                    created_by: 6990255,
                    custom_fields_values: [{
                        field_id: 783578,
                        field_name: "Телефон",
                        field_code: "PHONE",
                        values: [{
                            value: incomingNumber,
                            enum_id: 1760384,
                            enum_code: "MOB"
                        }]
                    }, {
                        field_id: 1288764,
                        field_name: "LG Tel",
                        field_code: null,
                        values: [{
                            value: sipTrunkMap[incomingTrunk]
                        }]
                    }]
            };

            const result: AmocrmCreateContactResponse = (await this.amocrm.request.port(amocrmAPI.contacts, contact))?.data;
            this.logger.info(`Результат создание нового контакта по номеру  ${incomingNumber}: ${result._embedded.contacts}`);
            return result._embedded.contacts[0].id;
        } catch(e) {
            this.logger.error(`createContact ${incomingNumber} ${e}`);
            throw e;
        }

    }

    private async createLeads(incomingNumber: string, incomingTrunk: operatorCIDNumber, contactsId: number): Promise<boolean> {
        try {
            const responsibleUserId = this.getResponsibleUserId();
            const lead: AmocrmCreateLead = {
                name: (incomingTrunk === '845467')? 'Входящий вызов на номер 8800 MG_CALL': 'MG_CALL',
                responsible_user_id: Number(responsibleUserId),
                created_by: 6990255,
                pipeline_id: (incomingTrunk === '845467')? 4589241 : undefined,
                status_id: (incomingTrunk === '845467')? 43361652 : 14222500,
                custom_fields_values: [{
                    field_id: 1288762,
                    field_name: "LG Tel",
                    values: [{
                        value: sipTrunkMap[incomingTrunk]
                    }]
                }],
                _embedded: {
                    contacts: [{
                        id: contactsId
                }]}
            };

            if (numberDescriptionkMap[incomingTrunk] !== "") {
                lead.custom_fields_values.push({
                    field_id: 1274981,
                    field_name: "Поселок",
                    values: [{
                        value: numberDescriptionkMap[incomingTrunk],
                        enum: 2947510
                    }]
                })
            };
            this.logger.info(lead);
            const result: AmocrmCreateLeadResponse = (await this.amocrm.request.post(amocrmAPI.leads, [lead])).data;
            this.logger.info(`Результат создание новой сделки по номеру  ${incomingNumber}: ${result._embedded.leads}`);
            return true;
        }catch(e){
            this.logger.error(`createContact ${incomingNumber} ${e}`);
            throw e;
        }
    }

    private getResponsibleUserId(): responsibleUserId {
        const date = new Date();
        return (date.getHours() >= 19 && date.getHours() <= 22) ? responsibleUserId.AdminNotWork : responsibleUserId.AdminCC;
    }

    private async connect() {
        return await this.amocrmConnect.connect();
    }

}
