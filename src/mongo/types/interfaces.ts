import {CollectionType,DbRequestType} from './types';

export interface PlainObject { [key: string]: any }

export interface MongoRequestParamsInterface {
    criteria?: PlainObject;
    entity: CollectionType;
    requestType: DbRequestType;
    data?: PlainObject;
    fields?: { [name: string]: number };
}

export interface MongoApiResultInterface {
    result: boolean;
    requestType: DbRequestType;
    data?: any;
    message?: any;
    entity: CollectionType;
}

export interface ProductsStruct {
    _id: string;
    Ecwid_ID: string;
    Article_Ecwid: string;
    Category: string;
    Title: string;
    Price: string;
    Valute: string;
}