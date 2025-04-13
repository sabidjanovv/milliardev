import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { ProjectModule } from './project/project.module';
import { CustomerModule } from './customer/customer.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TelegrafModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const botToken = configService.get('BOT_TOKEN'); 
        console.log(botToken);
        
        if (!botToken) {
          throw new Error('BOT_TOKEN is not defined in .env file'); 
        }
        return {
          token: botToken, // faqat string qaytariladi
          include: [BotModule], // modulni kiritish
          middlewares: [], // agar kerak bo'lsa, middleware qo'shish
        };
      },
      inject: [ConfigService], // ConfigService ni inject qilish
    }),
    MongooseModule.forRoot(process.env.MONGO_URI || ''),
    AdminModule,
    MailModule,
    AuthModule,
    AddressModule,
    ProjectModule,
    CustomerModule,
    BotModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
