import { Document, Schema } from 'mongoose';
import { AmocrmUsers, LdsUsersStatus } from '../schemas';

export enum CollectionType {
  amocrmUsers = 'amocrmUsers',
  ldsUserStatus = 'ldsUserStatus',

}

export enum DbRequestType {
  findAll = 'findAll',
  findById = 'findById',
  updateById = 'updateById',
  insert = 'insert',
  delete = 'delete',
  deleteMany = 'deleteMany',
  insertMany = 'insertMany'
}


export type SchemaType = {
  [key in CollectionType]?: {
    schema: Schema<Document>;
    class: SchemaClassType;
  };
};

type SchemaClassType = typeof AmocrmUsers | typeof LdsUsersStatus ;
