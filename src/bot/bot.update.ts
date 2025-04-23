import { Ctx, On, Start, Update, Action, Hears } from 'nestjs-telegraf';
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

  // @Action('yes')
  // async onYes(@Ctx() ctx: Context) {
  //   const userId = ctx.from?.id;
  //   if (!userId) return;

  //   const user = await this.customerModel.findOne({ tg_id: userId });
  //   const lang = user?.lang || 'uz'; // Default to 'uz' if no language is found

  //   if (user?.is_active == true) {
  //     const contactMessage = await this.botService.getLocalizedMessage(
  //       lang,
  //       'alreadyRegistered',
  //     );
  //     await ctx.reply(contactMessage);
  //     return;
  //   }

  //   await this.botService.askForFirstName(ctx, lang);
  // }

  @Action('yes')
  async onYes(@Ctx() ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    let user = await this.customerModel.findOne({ tg_id: userId });

    if (!user) {
      user = new this.customerModel({
        tg_id: userId,
        lang: 'uz', // Default language
        current_step: 'first_name',
      });
      await user.save();
    }

    const lang = user.lang || 'uz';

    if (user.is_active) {
      const msg = await this.botService.getLocalizedMessage(
        lang,
        'alreadyRegistered',
      );
      return await ctx.reply(msg);
    }

    // Start the process by asking for the first name
    await this.botService.askForFirstName(ctx, lang);
  }

  @Action('no')
  async onNo(@Ctx() ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = await this.customerModel.findOne({ tg_id: userId });
    const lang = user?.lang || 'uz'; // Default to 'uz' if no language is found

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

  // @On('text')
  // async onText(@Ctx() ctx: Context) {
  //   const userId = ctx.from?.id;
  //   if (!userId || !ctx.message || !('text' in ctx.message)) return;

  //   const response = ctx.message.text.trim().toLowerCase();
  //   if (!response) return;

  //   const user = await this.customerModel.findOne({ tg_id: userId });
  //   if (!user) return;

  //   const lang = user.lang || 'uz';

  //   if (!user.first_name) {
  //     await this.customerModel.updateOne(
  //       { tg_id: userId },
  //       { first_name: response },
  //     );
  //     return await this.botService.askForLastName(ctx, lang);
  //   }

  //   if (!user.last_name) {
  //     await this.customerModel.updateOne(
  //       { tg_id: userId },
  //       { last_name: response },
  //     );
  //     return await this.botService.askForEmail(ctx, lang);
  //   }

  //   if (!user.email) {
  //     await this.customerModel.updateOne(
  //       { tg_id: userId },
  //       { email: response, is_active: true },
  //     );
  //     const contactMessage = await this.botService.getLocalizedMessage(
  //       lang,
  //       'contactMessage',
  //     );
  //     await ctx.reply(contactMessage);
  //   }

  //   await ctx.reply(
  //     await this.botService.getLocalizedMessage(lang, 'allDataCompleted'),
  //   );
  // }

  // @On('text')
  // async onText(@Ctx() ctx: Context) {
  //   const userId = ctx.from?.id;
  //   if (!userId || !ctx.message || !('text' in ctx.message)) return;

  //   const response = ctx.message.text.trim();
  //   if (!response) return;

  //   const user = await this.customerModel.findOne({ tg_id: userId });
  //   if (!user) return;

  //   const lang = user.lang || 'uz';

  //   if (!user.first_name) {
  //     await this.customerModel.updateOne(
  //       { tg_id: userId },
  //       { first_name: response },
  //     );
  //     return await this.botService.askForLastName(ctx, lang);
  //   }

  //   if (!user.last_name) {
  //     await this.customerModel.updateOne(
  //       { tg_id: userId },
  //       { last_name: response },
  //     );
  //     return await this.botService.askForEmail(ctx, lang);
  //   }

  //   if (!user.email) {
  //     await this.customerModel.updateOne(
  //       { tg_id: userId },
  //       { email: response, is_active: true },
  //     );
  //     const contactMsg = await this.botService.getLocalizedMessage(
  //       lang,
  //       'contactMessage',
  //     );
  //     await ctx.reply(contactMsg);
  //     return await ctx.reply(
  //       await this.botService.getLocalizedMessage(lang, 'allDataCompleted'),
  //     );
  //   }

  //   // Hammasi bo‘lsa: fallback message
  //   await ctx.reply(
  //     await this.botService.getLocalizedMessage(lang, 'alreadyRegistered'),
  //   );
  // }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId || !ctx.message || !('text' in ctx.message)) return;

    const text = ctx.message.text.trim().toLowerCase(); // Textni kichik harflarda tekshirish
    const user = await this.customerModel.findOne({ tg_id: userId });
    if (!user) return;

    const lang = user.lang || 'uz';

    // Agar foydalanuvchi "Yes", "Да", yoki "ha" deb yozgan bo'lsa, "first_name" ni so'rash
    if (
      ['yes', 'да', 'ha'].includes(text.toLowerCase()) &&
      user.current_step === 'first_name'
    ) {
      return await this.botService.askForFirstName(ctx, lang);
    }

    console.log(user.current_step);
    switch (user.current_step) {
      case 'first_name':
        if (!text) {
          return await ctx.reply(
            await this.botService.getLocalizedMessage(
              lang,
              'pleaseProvideFirstName',
            ),
          );
        }
        user.first_name = text;
        user.current_step = 'last_name'; // Moving to next step
        await user.save();
        return await this.botService.askForLastName(ctx, lang);

      case 'last_name':
        if (!text) {
          return await ctx.reply(
            await this.botService.getLocalizedMessage(
              lang,
              'pleaseProvideLastName',
            ),
          );
        }
        user.last_name = text;
        user.current_step = 'email'; // Moving to email step
        await user.save();
        return await this.botService.askForEmail(ctx, lang);

      case 'email':
        if (!text) {
          return await ctx.reply(
            await this.botService.getLocalizedMessage(
              lang,
              'pleaseProvideEmail',
            ),
          );
        }
        user.email = text;
        user.is_active = true;
        user.current_step = null; // No more steps
        await user.save();
        await ctx.reply(
          await this.botService.getLocalizedMessage(lang, 'contactMessage'),
        );
        return await ctx.reply(
          await this.botService.getLocalizedMessage(lang, 'allDataCompleted'),
        );

      default:
        return await ctx.reply(
          await this.botService.getLocalizedMessage(lang, 'unknownCommand'),
        );
    }
  }
}
