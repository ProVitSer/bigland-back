import { apiStatusDND } from "@app/asterisk/types/interfaces";

export interface ISmsData {
    number: string;
    text: string;
}

export interface IDnd {
    sip_id: Array<string>;
    dnd_status: apiStatusDND;
}


export interface MonitoringCall {
    numbers: Array<string>;
    description: string;
}

export interface MonitoringCallResult {
    number: string,
    isCallSuccessful: boolean
}