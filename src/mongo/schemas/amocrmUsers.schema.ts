import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CollectionType } from '../types/types';
import * as mongoose from 'mongoose';

@Schema({ collection: CollectionType.amocrmUsers, versionKey: false })
export class AmocrmUsers {
    @Prop()
    amocrmId: number;

    @Prop()
    localExtension: number;
}

export const AmocrmUsersSchema = SchemaFactory.createForClass(AmocrmUsers);

export type CallDocument = AmocrmUsers & Document;