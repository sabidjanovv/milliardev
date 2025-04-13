import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotUpdate } from './bot.update';
import { Bot, BotSchema } from './schemas/bot.schema';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from '../customer/schemas/customer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bot.name, schema: BotSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
    JwtModule.register({}),
  ],
  providers: [BotService, BotUpdate],
})
export class BotModule {}
