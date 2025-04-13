import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BotDocument = Bot & Document;

@Schema({ versionKey: false, timestamps: false })
export class Bot {
  @Prop({ unique: true })
  username: string;

  @Prop({ unique: true })
  user_id: string;

  @Prop({ unique: true, required: false })
  phone_number: string;

  @Prop({ required: false })
  first_name: string;

  @Prop({ required: false })
  last_name: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: 'ru' })
  lang: string;
}

export const BotSchema = SchemaFactory.createForClass(Bot);
