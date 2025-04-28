import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as moment from 'moment-timezone';

export type ServiceDocument = Service & Document;

@Schema({ versionKey: false })
export class Service {
  @Prop({ type: String, required: false })
  name: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: String, required: false })
  link: string;

  @Prop({ type: String, required: false, default: null })
  image?: string;

  @Prop({ type: String, ref: 'Admin', required: true })
  adminId: string;

  @Prop({ type: String })
  createdAt: string;

  @Prop({ type: String })
  updatedAt: string;
}

export const ServiceSchema = SchemaFactory.createForClass(Service)

ServiceSchema.pre('save', function (next) {
  if (!this.createdAt) {
    this.set({
      createdAt: moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss'),
    });
  }
  this.set({
    updatedAt: moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss'),
  });
  next();
});

ServiceSchema.pre('findOneAndUpdate', function (next) {
  this.set({
    updatedAt: moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss'),
  });
  next();
});
