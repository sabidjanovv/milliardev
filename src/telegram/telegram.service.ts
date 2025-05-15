import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { ProjectDocument } from '../project/schemas/project.schema';

@Injectable()
export class TelegramService {
  private bot: TelegramBot;

  constructor() {
    const botToken = process.env.BOT_TOKEN;

    if (!botToken) {
      throw new Error('BOT_TOKEN environment variable is not set');
    }

    this.bot = new TelegramBot(botToken, {
      polling: false,
    });
  }

  private formatProjectMessage(project: ProjectDocument): string {
    const status = project.is_done ? '✅ Bajarilgan' : '🕐 Hali davom etmoqda';
    const description = project.description
      ? project.description.length > 200
        ? project.description.slice(0, 200) + '...'
        : project.description
      : 'Izoh mavjud emas.';
    const link = project.link ? `🔗 Link: ${project.link}` : '';

    return `
<b>🛠 Proyekt nomi:</b> ${project.name || 'Nomaʼlum'}
<b>📄 Taʼrifi:</b> ${description}
${link}
<b>📌 Holati:</b> ${status}
    `.trim();
  }

  async sendProjectToUser(userId: string, project: ProjectDocument) {
    const message = this.formatProjectMessage(project);

    await this.bot.sendMessage(userId, message, {
      parse_mode: 'HTML',
    });
  }
}
