// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import * as moment from 'moment-timezone';
// import { Document } from 'mongoose';

// export type CustomerDocument = Customer & Document;

// @Schema({ versionKey: false })
// export class Customer {
//   @Prop({ required: false, unique: true })
//   username: string;

//   @Prop({ required: false, unique: true })
//   tg_id: string;

//   @Prop({ required: false, unique: true })
//   phone_number: string;

//   @Prop({ required: false, unique: true })
//   email: string;

//   @Prop()
//   first_name: string;

//   @Prop()
//   last_name: string;

//   @Prop({ default: true })
//   is_active: boolean;

//   @Prop({ default: 'ru' })
//   lang: string;

//   @Prop()
//   createdAt: string;

//   @Prop()
//   updatedAt: string;
// }

// export const CustomerSchema = SchemaFactory.createForClass(Customer);

// CustomerSchema.index(
//   { phone_number: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       phone_number: { $exists: true, $gt: '' },
//     },
//   },
// );

// CustomerSchema.index(
//   { email: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       email: { $exists: true, $gt: '' },
//     },
//   },
// );

// CustomerSchema.index(
//   { tg_id: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       tg_id: { $exists: true, $gt: '' },
//     },
//   },
// );

// CustomerSchema.index(
//   { username: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       username: { $exists: true, $gt: '' },
//     },
//   },
// );

// CustomerSchema.pre('save', function (next) {
//   if (!this.createdAt) {
//     this.set({
//       createdAt: moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss'),
//     });
//   }
//   this.set({
//     updatedAt: moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss'),
//   });
//   next();
// });

// CustomerSchema.pre('findOneAndUpdate', function (next) {
//   this.set({
//     updatedAt: moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss'),
//   });
//   next();
// });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as moment from 'moment-timezone';
import { Document } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ versionKey: false })
export class Customer {
  @Prop({ required: false, unique: true })
  username: string;

  @Prop({ required: false, unique: true })
  tg_id: string;

  @Prop({ required: false, unique: true })
  phone_number: string;

  @Prop({ required: false, unique: true })
  email: string;

  @Prop()
  first_name: string;

  @Prop()
  last_name: string;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: 'ru' })
  lang: string;

  @Prop()
  createdAt: string;

  @Prop()
  updatedAt: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.pre('save', function (next) {
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

CustomerSchema.pre('findOneAndUpdate', function (next) {
  this.set({
    updatedAt: moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss'),
  });
  next();
});