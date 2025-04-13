import { Injectable } from '@nestjs/common';
import { Context, Markup } from 'telegraf';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bot, BotDocument } from './schemas/bot.schema';
import {
  Customer,
  CustomerDocument,
} from '../customer/schemas/customer.schema';

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot.name) private readonly botModel: Model<BotDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {}

  private isContactMessage(message: any): message is Context['message'] & {
    contact: { user_id: number; phone_number: string };
  } {
    return 'contact' in message;
  }

  private isTextMessage(
    message: any,
  ): message is Context['message'] & { text: string } {
    return 'text' in message;
  }

  private async findUser(userId: number) {
    return this.botModel.findOne({ user_id: userId });
  }

  private async updateUser(userId: number, update: any) {
    return this.botModel.findOneAndUpdate({ user_id: userId }, update);
  }

  async start(ctx: Context) {
    const userId = ctx.from?.id;
    if (!userId) return;

    let user = await this.findUser(userId);
    if (!user) {
      user = await this.botModel.create({
        user_id: userId,
        username: ctx.from?.username,
        first_name: ctx.from?.first_name,
        last_name: ctx.from?.last_name,
        lang: null,
        phone_number: null,
        status: false,
      });

      await this.customerModel.create({
        tg_id: userId,
        first_name: null,
        last_name: null,
        is_active: false,
        phone_number: null,
        email: null,
        lang: null,
      });

      return this.askForLanguage(ctx);
    }

    if (!user.lang) return this.askForLanguage(ctx);
    if (!user.phone_number) return this.askForPhone(ctx, user.lang);

    await ctx.reply(
      await this.getLocalizedMessage(user.lang, 'alreadyRegistered'),
      Markup.removeKeyboard(),
    );
  }

  async askForLanguage(ctx: Context) {
    await ctx.reply(
      "Please select a language:\n\n🇺🇿 O'zbek tili\n🇷🇺 Русский\n🇬🇧 English",
      Markup.inlineKeyboard([
        [Markup.button.callback('🇺🇿 O‘zbek tili', 'lang_uz')],
        [Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
        [Markup.button.callback('🇬🇧 English', 'lang_en')],
      ]),
    );
  }

  async setLanguage(ctx: Context, language: string) {
    const userId = ctx.from?.id;
    if (!userId) return;

    await this.updateUser(userId, { lang: language });

    const updatedUser = await this.findUser(userId);
    if (!updatedUser?.lang) {
      return ctx.reply('Language setting failed.');
    }

    const customer = await this.customerModel.findOne({ tg_id: userId });
    if (customer) {
      customer.lang = language;
      await customer.save();
    }

    updatedUser.phone_number
      ? await ctx.reply(
          await this.getLocalizedMessage(updatedUser.lang, 'changeLanguage'),
          Markup.removeKeyboard(),
        )
      : this.askForPhone(ctx, updatedUser.lang);
  }

  async askForPhone(ctx: Context, language: string) {
    const messages = {
      uz: '📱 Iltimos, telefon raqamni yuboring.',
      ru: '📱 Пожалуйста, отправьте номер телефона.',
      en: '📱 Please send your phone number.',
    };

    const buttonMessages = {
      uz: '📱 Telefon raqamingizni yuboring',
      ru: '📱 Отправьте свой номер телефона',
      en: '📱 Send your phone number',
    };

    await ctx.reply(messages[language] || messages['uz'], {
      parse_mode: 'HTML',
      ...Markup.keyboard([
        [
          Markup.button.contactRequest(
            buttonMessages[language] || buttonMessages['uz'],
          ),
        ],
      ])
        .resize()
        .oneTime(),
    });
  }

  async onContact(ctx: Context) {
    // Telefon raqamining yuborilganligini tekshirish
    if (!this.isContactMessage(ctx.message)) return;

    const userId = ctx.from?.id;
    if (!userId) return;

    // Foydalanuvchini topish
    const user = await this.findUser(userId);
    if (!user || ctx.message.contact.user_id !== userId) {
      // Foydalanuvchi tasdiqlanmadi, noto'g'ri raqam yuborildi
      await ctx.reply('Please send only your phone number.');
      return;
    }

    // Telefon raqamini yangilash va foydalanuvchi holatini tasdiqlash
    await this.updateUser(userId, {
      phone_number: ctx.message.contact.phone_number,
      status: true,
    });

    // Mijozni yangilash
    const customer = await this.customerModel.findOne({ tg_id: userId });
    if (customer) {
      customer.phone_number = ctx.message.contact.phone_number;
      await customer.save();
    }

    // // Klaviaturani olib tashlash
    // await ctx.reply(
    //   'Phone number updated successfully.',
    //   Markup.removeKeyboard(),
    // );

    // Tasdiqlashni so'rash
    this.askForConfirmation(ctx, user.lang);
  }

  async askForConfirmation(ctx: Context, language: string) {
    const messages = {
      uz: "Bizga qiziqqaningiz uchun raxmat, siz bilan bog'lanishimizni xohlaysizmi?",
      ru: 'Спасибо за ваш интерес, хотите ли вы, чтобы мы с вами связались?',
      en: 'Thank you for your interest, would you like us to contact you?',
    };

    const buttonMessages = {
      uz: ['Ha', "Yo'q"],
      ru: ['Да', 'Нет'],
      en: ['Yes', 'No'],
    };

    return await ctx.reply(messages[language] || messages['uz'], {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: buttonMessages[language][0], callback_data: 'yes' },
            { text: buttonMessages[language][1], callback_data: 'no' },
          ],
        ],
      },
    });
  }

  async handleUserResponse(ctx: Context, user: any, response: string) {
    const language = user?.lang || 'uz';
    const validResponses = ['yes', 'ha', 'да', 'no', "yo'q", 'нет'];

    if (!validResponses.includes(response.toLowerCase())) {
      // Noto‘g‘ri javob yuborsa, avtomatik ravishda noContactRequired yuboriladi
      const noContactMessage = await this.getLocalizedMessage(
        language,
        'noContactRequired',
      );
      return await ctx.reply(noContactMessage);
    }

    if (['yes', 'ha', 'да'].includes(response.toLowerCase())) {
      this.askForFirstName(ctx, language);
    } else {
      const noContactMessage = await this.getLocalizedMessage(
        language,
        'noContactRequired',
      );
      await ctx.reply(noContactMessage);
    }
  }

  async askForFirstName(ctx: Context, language: string) {
    const firstNameMessage = await this.getLocalizedMessage(
      language,
      'askForFirstName',
    );
    await ctx.reply(firstNameMessage);
  }

  async askForLastName(ctx: Context, language: string) {
    const lastNameMessage = await this.getLocalizedMessage(
      language,
      'askForLastName',
    );
    await ctx.reply(lastNameMessage);
  }

  async askForEmail(ctx: Context, language: string) {
    const emailMessage = await this.getLocalizedMessage(
      language,
      'askForEmail',
    );
    await ctx.reply(emailMessage); // To'g'ri xabarni yuborish
  }

  async handleNoContact(ctx: Context, language: string) {
    const noMassage = await this.getLocalizedMessage(
      language,
      'askForFirstName',
    );
    await ctx.reply(noMassage);
  }

  async getLocalizedMessage(language: string, key: string): Promise<string> {
    const messages = {
      uz: {
        askForFirstName: '👤 Iltimos, ismingizni kiriting.',
        askForLastName: '👤 Iltimos, familiyangizni kiriting.',
        askForEmail: '📱 Iltimos, emailingizni kiriting.',
        noContactRequired: "🚫 Iltimos, biz bilan bog'lanishni talab qilmaydi.",
        nameReceived: '✅ Ism va familiya qabul qilindi. Rahmat! 🎉',
        contactMessage:
          '📩 Tez orada siz bilan aloqaga chiqamiz. Sabrsizlik bilan kuting. ⏳',
        allDataCompleted: "🎊 Barcha ma'lumotlar qabul qilindi. Rahmat! 🙌",
        changeLanguage: "🌍 Til muvaffaqiyatli o'zgartirildi.",
        alreadyRegistered: "🔹 Siz allaqachon ro'yxatdan o'tdingiz.",
        noMessageAnswer: 'Javobingiz uchun raxmat! ☺️',
      },
      ru: {
        askForFirstName: '👤 Пожалуйста, введите ваше имя.',
        askForLastName: '👤 Пожалуйста, введите вашу фамилию.',
        askForEmail: '📱 Пожалуйста, введите вашу электронную почту.',
        noContactRequired: '🚫 Пожалуйста, не требуется связаться с нами.',
        nameReceived: '✅ Имя и фамилия приняты. Спасибо! 🎉',
        contactMessage:
          '📩 Мы свяжемся с вами в ближайшее время. Пожалуйста, подождите. ⏳',
        allDataCompleted: '🎊 Все данные получены. Спасибо! 🙌',
        changeLanguage: '🌍 Язык успешно изменен.',
        alreadyRegistered: '🔹 Вы уже зарегистрированы.',
        noMessageAnswer: 'Спасибо за ваш ответ! ☺️',
      },
      en: {
        askForFirstName: '👤 Please, enter your first name.',
        askForLastName: '👤 Please, enter your last name.',
        askForEmail: '📱 Please, enter your email address.',
        noContactRequired: '🚫 Please, no contact required.',
        nameReceived: '✅ First name and last name received. Thank you! 🎉',
        contactMessage: '📩 We will contact you soon. Please wait. ⏳',
        allDataCompleted: '🎊 All data completed. Thank you! 🙌',
        changeLanguage: '🌍 Language successfully changed.',
        alreadyRegistered: '🔹 You have already registered.',
        noMessageAnswer: 'Thank you for your response! ☺️',
      },
    };

    return (
      messages[language]?.[key] || messages['uz'][key] || 'Message not found'
    );
  }
}
