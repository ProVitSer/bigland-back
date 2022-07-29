import { operatorCIDNumber, OriginalCIDNumber } from '../config/config';
import { amocrmCallStatus, pbxCallStatus } from './types/interfaces';


export enum AmoCRMAPIV2  {
    auth = "/private/api/auth.php?type=json",
    account = "/private/api/v2/account",
    events = "/api/v2/events/"

}
export const RecordPathFormat = "YYYY/MM/DD"

export const sipTrunkMap: { [code in operatorCIDNumber]: OriginalCIDNumber } = {
    [operatorCIDNumber.MOBILE1]: OriginalCIDNumber.MOBILE1,
    [operatorCIDNumber.MOBILE2]: OriginalCIDNumber.MOBILE2,
    [operatorCIDNumber.MOBILE3]: OriginalCIDNumber.MOBILE3,
    [operatorCIDNumber.MOBILE4]: OriginalCIDNumber.MOBILE4,
    [operatorCIDNumber.MOBILE5]: OriginalCIDNumber.MOBILE5,
    [operatorCIDNumber.MOBILE6]: OriginalCIDNumber.MOBILE6,
    [operatorCIDNumber.MOBILE7]: OriginalCIDNumber.MOBILE7,
    [operatorCIDNumber.GOROD1]: OriginalCIDNumber.GOROD1,
    [operatorCIDNumber.GOROD2]: OriginalCIDNumber.GOROD2,
    [operatorCIDNumber.GOROD3]: OriginalCIDNumber.GOROD3,
    [operatorCIDNumber.GOROD4]: OriginalCIDNumber.GOROD4,
    [operatorCIDNumber.GOROD5]: OriginalCIDNumber.GOROD5,
    [operatorCIDNumber.GOROD6]: OriginalCIDNumber.GOROD6,
    [operatorCIDNumber.MANGOOBZVONCC]: OriginalCIDNumber.MANGOOBZVONCC,

};

export const AmocrmNamekMap: { [code in operatorCIDNumber]?: string } = {
    [operatorCIDNumber.MANGOOBZVONCC]: 'Обзвон роботом',
    [operatorCIDNumber.MOBILE7]: 'Входящий вызов на номер 8800 MG_CALL',
}

export const AmocrmStatusIdMap: { [code in operatorCIDNumber]?: number } = {
    [operatorCIDNumber.MANGOOBZVONCC]: 49213284,
    [operatorCIDNumber.MOBILE7]: 43361652,
}

export const numberDescriptionkMap: { [code in operatorCIDNumber]: string } = {
    [operatorCIDNumber.MOBILE1]: "",
    [operatorCIDNumber.MOBILE2]: "",
    [operatorCIDNumber.MOBILE3]: "",
    [operatorCIDNumber.MOBILE4]: "",
    [operatorCIDNumber.MOBILE5]: "",
    [operatorCIDNumber.MOBILE6]: "",
    [operatorCIDNumber.MOBILE7]: "",
    [operatorCIDNumber.GOROD1]: "",
    [operatorCIDNumber.GOROD2]: "",
    [operatorCIDNumber.GOROD3]: "SYN_61 Усадьба в Подмосковье",
    [operatorCIDNumber.GOROD4]: "SYN_35 Усадьба в Подмосковье",
    [operatorCIDNumber.GOROD5]: "SYN_39 Усадьба в Подмосковье",
    [operatorCIDNumber.GOROD6]: "SYN_34 Усадьба в Подмосковье",
    [operatorCIDNumber.MANGOOBZVONCC]: "",

};

export const callStatuskMap: { [code in pbxCallStatus]?: amocrmCallStatus } = {
    [pbxCallStatus.ANSWERED]: amocrmCallStatus.Answer,
    [pbxCallStatus.NOANSWER]: amocrmCallStatus.NoAnswer,
    [pbxCallStatus.BUSY]: amocrmCallStatus.Busy,
}

export enum ResponsibleUserId {
    AdminCC = 6019824,
    AdminNotWork = 3779682
}

export enum CreatedById {
    AdminCC  = 6990255
}

export enum CustomFieldsValuesId{
    ContactsPhone = 783578,
    LeadsLgTel = 1288762,
    ContactsLgTel = 1288764,
    Village = 1274981
}

export enum CustomFieldsValuesEnumId{
    Number = 1760384,
    VillageNumber = 2947510
}

export enum ApplicationStage {
    DozvonCC = 14222500,
    OstavilZayavku = 14222500
}

export enum PipelineId {
    MGSale = 519481,
    Village = 4589241
}