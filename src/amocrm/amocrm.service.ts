import { LogService } from '@app/logger/logger.service';
import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AmocrmConnector } from './amocrm.connect';
import { AmocrmAddCallInfo, AmocrmAddCallInfoResponse, amocrmAPI, AmocrmContact, AmocrmCreateContact, AmocrmCreateContactResponse, AmocrmCreateLead, AmocrmCreateLeadResponse, AmocrmGetContactsRequest, 
    AmocrmGetContactsResponse, directionType, httpMethod } from './types/interfaces';
import { AmoCRMAPIV2, AmocrmNamekMap, AmocrmStatusIdMap, ApplicationStage, callStatuskMap, CreatedById, CustomFieldsValuesEnumId, CustomFieldsValuesId, numberDescriptionkMap, PipelineId, RecordPathFormat, ResponsibleUserId, sipTrunkMap } from './config';
import { operatorCIDNumber } from '../config/config'; 
import * as moment from 'moment';
import { Cdr } from '@app/database/entities/Cdr';
import { PlainObject } from '@app/mongo/types/interfaces';
import { ConfigService } from '@nestjs/config';
import axios, { HttpService } from '@nestjs/axios';

@Injectable()
export class AmocrmService implements OnApplicationBootstrap {

    public amocrm: any;
    private readonly recordDomain = this.configService.get('customConf.recordDomain');
    private readonly amocrmApiV2Domain = this.configService.get('amocrm.v2.apiV2Domain');
    private authCookies: any
    private headers = {
        'User-Agent': this.configService.get('amocrm.v2.userAgent'),
        'Content-Type': this.configService.get('amocrm.v2.contentType')
    };

    constructor(
        private readonly amocrmConnect: AmocrmConnector,
        private readonly logger: LogService,
        private readonly configService: ConfigService,
        private httpService: HttpService,

    ) {
    }

    public async onApplicationBootstrap() {
        this.amocrm = await this.connect();
    }


    public async actionsInAmocrm(incomingNumber: string , incomingTrunk: operatorCIDNumber): Promise<void>{
        try {
            const searchNumber = (incomingNumber.length == 10) ? incomingNumber : incomingNumber.substr(incomingNumber.length - 10);
            const resultSearchContact = await this.searchContact(searchNumber);
            if (resultSearchContact == false) {
                const idCreateContact = await this.createContact(incomingNumber, incomingTrunk);
                await this.createLeads(incomingNumber, incomingTrunk, idCreateContact);
            }
        } catch(e){
            this.logger.info(console.log(`Ошибка взаимодействия с Amocrm по Лидам,Контактам`, e));
            return
        }
    }

    public async sendCallInfoToCRM(result: Cdr, amocrmId : number,  direction : directionType) {
        try {
            const { uniqueid, src, dst, calldate, billsec, disposition, recordingfile } = result;
            const date = moment(calldate).subtract(3, "hour").unix();

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
                "created_at": date,
                "updated_at": date,
            }

            this.logger.info(callInfo);
            const resultSendCallIfo = (await this.amocrm.request.post(amocrmAPI.call, [callInfo]));
            this.logger.info(resultSendCallIfo.data);
            return this.validationErrors(resultSendCallIfo.data);
        } catch(e){
            throw e;
        }
    }

    public async searchContact(incomingNumber: string): Promise<boolean>{
        try {
            const info: AmocrmGetContactsRequest = {
                query: incomingNumber
            }
            const result: AmocrmGetContactsResponse = (await this.amocrm.request.get(amocrmAPI.contacts, info))?.data;
            this.logger.info(`Результат поиска контакта ${incomingNumber}: ${JSON.stringify(result)}`);
            return (result == undefined)? false : true;
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
                    responsible_user_id: responsibleUserId,
                    created_by: CreatedById.AdminCC,
                    custom_fields_values: [{
                        field_id: CustomFieldsValuesId.ContactsPhone,
                        field_name: "Телефон",
                        field_code: "PHONE",
                        values: [{
                            value: incomingNumber,
                            enum_id: CustomFieldsValuesEnumId.Number,
                            enum_code: "MOB"
                        }]
                    }, {
                        field_id: CustomFieldsValuesId.ContactsLgTel,
                        field_name: "LG Tel",
                        field_code: null,
                        values: [{
                            value: (sipTrunkMap[incomingTrunk]) ? sipTrunkMap[incomingTrunk] : incomingTrunk
                        }]
                    }]
            };
            this.logger.info(contact);
            const result = (await this.amocrm.request.post(amocrmAPI.contacts, [contact]))
            if(result.data.status != undefined && [400,401].includes(result.data.status)){
                this.logger.error(result.data['validation-errors'][0].errors);
                throw Error(result.data['validation-errors'][0].errors)
            } else {
                this.logger.info(console.log(`Результат создание нового контакта по номеру  ${incomingNumber}: `, result.data));
                let info: AmocrmCreateContactResponse = result.data
                return info._embedded.contacts[0].id;
            }
        } catch(e) {
            this.logger.error(e);
            throw e;
        }

    }

    private async createLeads(incomingNumber: string, incomingTrunk: operatorCIDNumber, contactsId: number): Promise<boolean> {
        try {
            const responsibleUserId = this.getResponsibleUserId();
            const lead: AmocrmCreateLead = {
                name: (AmocrmNamekMap[incomingTrunk]) ? AmocrmNamekMap[incomingTrunk]: 'MG_CALL' ,
                responsible_user_id: responsibleUserId,
                created_by: CreatedById.AdminCC,
                pipeline_id: (incomingTrunk === operatorCIDNumber.MOBILE7)? PipelineId.Village : undefined,
                status_id: (AmocrmStatusIdMap[incomingTrunk]) ? AmocrmStatusIdMap[incomingTrunk]: ApplicationStage.DozvonCC,
                custom_fields_values: [{
                    field_id: CustomFieldsValuesId.LeadsLgTel,
                    field_name: "LG Tel",
                    values: [{
                        value: (sipTrunkMap[incomingTrunk]) ? sipTrunkMap[incomingTrunk] : incomingTrunk
                    }]
                }],
                _embedded: {
                    contacts: [{
                        id: contactsId
                }]}
            };

            if (numberDescriptionkMap[incomingTrunk]) {
                lead.custom_fields_values.push({
                    field_id: CustomFieldsValuesId.Village,
                    field_name: "Поселок",
                    values: [{
                        value: (numberDescriptionkMap[incomingTrunk]) ? numberDescriptionkMap[incomingTrunk] : ""  ,
                        enum: CustomFieldsValuesEnumId.VillageNumber,
                    }]
                })
            };
            this.logger.info(lead);
            const result = (await this.amocrm.request.post(amocrmAPI.leads, [lead]));
            if(result.data.status != undefined && [400,401].includes(result.data.status)){
                this.logger.error(result.data['validation-errors'][0].errors);
                throw Error(result.data['validation-errors'][0].errors)
            } else {
                this.logger.info(console.log(`Результат создание новой сделки по номеру   ${incomingNumber}: `, result.data));
                let info: AmocrmCreateLeadResponse = result.data
                return true;
            }
        }catch(e){
            this.logger.error(e);
            throw e;
        }
    }

    public async incomingCallEvent(incomingNumber: string, eventResponsibleUserId: string): Promise<boolean> {
        try {   
            await this.auth();
            const body = JSON.stringify({
                add: [{
                      type: "phone_call",
                      phone_number: (incomingNumber.length == 10) ? incomingNumber : incomingNumber.substr(incomingNumber.length - 10),
                      users: [ eventResponsibleUserId ]
                }]
             });
            this.logger.info(body)
            this.headers['Cookie'] = this.authCookies;

            const result = await this.httpService.post(`${this.amocrmApiV2Domain}${AmoCRMAPIV2.events}`, body, { headers: this.headers } ).toPromise();
            return !!result.data;
        }catch(e){
            this.logger.error(e);
            throw e;
        }
    }

    private async auth(){
        try{
            const isAuth = await this.checkAuth();
            if(isAuth){
                return;
            }else{
                return await this.authAmocrm()
            }
        }catch(e){
            this.logger.error(e);
            throw e;
        }
    }

    private async checkAuth(): Promise<boolean>{
        try {
            const result = await this.httpService.get(`${this.amocrmApiV2Domain}${AmoCRMAPIV2.account}`).toPromise();
            return !!result.data.name;
        }catch(e){
            this.logger.error(e);
            throw e
        }
    }

    private async authAmocrm(): Promise<void>{
        try {
            const body = {
                "USER_LOGIN": this.configService.get('amocrm.v2.login'), 
                "USER_HASH": this.configService.get('amocrm.v2.hash'), 
             }
            const result = await this.httpService.post(`${this.amocrmApiV2Domain}${AmoCRMAPIV2.auth}`, body).toPromise();
            if(!!result.status && !!result.headers['set-cookie'] && result.status == HttpStatus.OK){
                this.authCookies =  result.headers['set-cookie'];
            } else {
                throw new Error(String(result))
            }
            return;
        } catch(e){
            this.logger.error(e);
            throw e;
        }
    }


    private getResponsibleUserId(): ResponsibleUserId {
        const date = new Date();
        return (date.getHours() >= 19 && date.getHours() <= 22) ? ResponsibleUserId.AdminCC : ResponsibleUserId.AdminCC;
    }

    private validationErrors(response: PlainObject): boolean | Error {
        if(response._total_items === 1 && response.errors.length > 0){
            response.errors.map((error: any) => {
                this.logger.error(error)
            })
            return Error('Ошибка обработки данных по вызову в AMO')
        } else {
            return true;
        }
     }

    private async connect() {
        return await this.amocrmConnect.connect();
    }

}
