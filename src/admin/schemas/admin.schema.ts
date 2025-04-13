import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as moment from 'moment-timezone';

export type AdminDocument = Admin & Document;

@Schema({ versionKey: false })
export class Admin {
  _id: string;
  @Prop({ type: String, required: true })
  full_name: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, unique: true })
  phone_number: string;

  @Prop({ type: Boolean, default: false })
  is_active: boolean;

  @Prop({ type: Boolean, default: false })
  is_creator: boolean;

  @Prop({ type: String, required: true })
  hashed_password: string;

  @Prop({ type: String, default: null })
  hashed_refresh_token?: string;

  @Prop({ type: String, default: null })
  activation_link?: string;

  @Prop({ type: String, required: false, ref: 'Admin', default: null })
  adminId: string;

  @Prop({ type: String })
  createdAt: string;

  @Prop({ type: String })
  updatedAt: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// AdminSchema.index(
//   { tel_secondary: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       tel_secondary: { $exists: true, $gt: '' },
//     },
//   },
// );

AdminSchema.pre('save', function (next) {
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

AdminSchema.pre('findOneAndUpdate', function (next) {
  this.set({
    updatedAt: moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss'),
  });
  next();
});