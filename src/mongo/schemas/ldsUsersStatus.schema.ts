import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CollectionType } from '../types/types';
import * as mongoose from 'mongoose';

@Schema({ collection: CollectionType.ldsUserStatus, versionKey: false })
export class LdsUsersStatus {
  @Prop()
  id: number;

  @Prop()
  sip_id: number | null;

  @Prop()
  is_active: boolean;

  @Prop()
  amo: Amo[] | [];

  @Prop()
  post: Post[] | [];
}

@Schema()
export class Amo {
  @Prop()
  user_id: number;

  @Prop()
  amo_account_id: number;

  @Prop()
  amo_id: number;
}

@Schema()
export class Post {
  @Prop()
  id: number;

  @Prop()
  title: string;

  @Prop()
  description: string | null;

  @Prop()
  plan_daily_calls_air: string;

  @Prop()
  plan_daily_calls_amount: number;
}

export const LdsUsersStatusSchema = SchemaFactory.createForClass(LdsUsersStatus);

export type LdsDocument = LdsUsersStatus & Document;