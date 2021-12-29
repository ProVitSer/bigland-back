import { operatorCIDNumber, OriginalCIDNumber } from '../config/config';
import { amocrmCallStatus, pbxCallStatus } from './types/interfaces';

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
};


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
};

export const callStatuskMap: { [code in pbxCallStatus]?: amocrmCallStatus } = {
    [pbxCallStatus.ANSWERED]: amocrmCallStatus.Answer,
    [pbxCallStatus.NOANSWER]: amocrmCallStatus.NoAnswer,
    [pbxCallStatus.BUSY]: amocrmCallStatus.Busy,
}