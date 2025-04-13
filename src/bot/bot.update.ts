import { Ctx, On, Start, Update, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { BotService } from './bot.service';
import { InjectModel } from '@nestjs/mongoose';
import {
  Customer,
  CustomerDocument,
} from '../customer/schemas/customer.schema';
import { Model } from 'mongoose';

@Update()
export class BotUpdate {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    private readonly botService: BotService,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.botService.start(ctx);
  }

  @Action('lang_uz')
  async setUzbek(@Ctx() ctx: Context) {
    await this.botService.setLanguage(ctx, 'uz');
  }

  @Action('lang_ru')
  async setRussian(@Ctx() ctx: Context) {
    await this.botService.setLanguage(ctx, 'ru');
  }

  @Action('lang_en')
  async setEnglish(@Ctx() ctx: Context) {
    await this.botService.setLanguage(ctx, 'en');
  }

  @Action('yes')
  async onYes(@Ctx() ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await this.customerModel.findOne({ tg_id: userId });
    const lang = user?.lang || 'uz'; // Default to 'uz' if no language is found

    // Use localized message for 'yes' response
    // const message = await this.botService.getLocalizedMessage(
    //   lang,
    //   'yesMessage',
    // );
    // await ctx.reply(message);

    if(user?.is_active == true) {
      const contactMessage = await this.botService.getLocalizedMessage(
        lang,
        'alreadyRegistered',
      );
      await ctx.reply(contactMessage);
      return;
    }

    await this.botService.askForFirstName(ctx, lang);
  }

  @Action('no')
  async onNo(@Ctx() ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await this.customerModel.findOne({ tg_id: userId });
    const lang = user?.lang || 'uz'; // Default to 'uz' if no language is found

    // // Use localized message for 'no' response
    // const message = await this.botService.getLocalizedMessage(
    //   lang,
    //   'noMessage',
    // );
    // await ctx.reply(message);

    if (user?.is_active == true) {
      const contactMessage = await this.botService.getLocalizedMessage(
        lang,
        'alreadyRegistered',
      );
      await ctx.reply(contactMessage);
      return;
    }

    await this.botService.handleNoContact(ctx, lang);
  }

  @On('contact')
  async onContact(@Ctx() ctx: Context) {
    await this.botService.onContact(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId || !ctx.message || !('text' in ctx.message)) return;

    const response = ctx.message.text.trim().toLowerCase();
    if (!response) return;

    const user = await this.customerModel.findOne({ tg_id: userId });
    if (!user) return;

    const lang = user.lang || 'uz';

    if (!user.first_name) {
      await this.customerModel.updateOne(
        { tg_id: userId },
        { first_name: response },
      );
      return await this.botService.askForLastName(ctx, lang);
    }

    if (!user.last_name) {
      await this.customerModel.updateOne(
        { tg_id: userId },
        { last_name: response },
      );
      return await this.botService.askForEmail(ctx, lang);
    }

    if (!user.email) {
      await this.customerModel.updateOne(
        { tg_id: userId },
        { email: response, is_active: true },
      );
      const contactMessage = await this.botService.getLocalizedMessage(
        lang,
        'contactMessage',
      );
      await ctx.reply(contactMessage);
    }

    await ctx.reply(
      await this.botService.getLocalizedMessage(lang, 'allDataCompleted'),
    );
  }
}
