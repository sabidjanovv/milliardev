import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import moment from 'moment-timezone';
import { HydratedDocument } from 'mongoose';

export type AddressDocument = HydratedDocument<Address>;

@Schema({ versionKey: false })
export class Address {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, required: true})
  phone_number: string;

  @Prop({ type: String, required: true })
  latitude_altitude: string;

  @Prop({ type: String, ref: 'Admin', required: true })
  adminId: string;

  @Prop({ type: String, ref: 'Admin' })
  updaterAdminId?: string;

  @Prop({ type: String })
  createdAt: string;

  @Prop({ type: String })
  updatedAt: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

AddressSchema.pre('save', function (next) {
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

AddressSchema.pre('findOneAndUpdate', function (next) {
  this.set({
    updatedAt: moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss'),
  });
  next();
});