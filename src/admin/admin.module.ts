import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    JwtModule.register({}),
    MailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [
    AdminService,
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
})
export class AdminModule {}
