import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as moment from 'moment-timezone';

export type ProjectDocument = Project & Document;

@Schema({ versionKey: false })
export class Project {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  link: string;

  @Prop({ type: String, required: false, default: null })
  image?: string;

  @Prop({ type: String, ref: 'Admin', required: true })
  adminId: string;

  @Prop({ type: String, ref: 'Admin', required: false, default: null })
  updaterAdminId: string;

  @Prop({ type: String })
  createdAt: string;

  @Prop({ type: String })
  updatedAt: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

ProjectSchema.pre('save', function (next) {
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

ProjectSchema.pre('findOneAndUpdate', function (next) {
  this.set({
    updatedAt: moment().tz('Asia/Tashkent').format('YYYY-MM-DD HH:mm:ss'),
  });
  next();
});
