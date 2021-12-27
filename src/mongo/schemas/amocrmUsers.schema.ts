import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CollectionType } from '../types/types';
import * as mongoose from 'mongoose';

@Schema({ collection: CollectionType.amocrmUsers, versionKey: false })
export class AmocrmUsers {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'any' })
    objectID: any;

    @Prop({ type: String, required: true })
    amocrmId: string;

    @Prop({ type: String, required: true })
    localExtension: string;
}

export const AmocrmUsersSchema = SchemaFactory.createForClass(AmocrmUsers);

export type CallDocument = AmocrmUsers & Document;