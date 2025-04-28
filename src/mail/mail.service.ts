import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Admin } from '../admin/schemas/admin.schema';
// import { User } from "../user/models/user.model";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail(admin: Admin) {
    const url = `${process.env.API_URL}/api/admin/activate/${admin.activation_link}`;
    await this.mailerService.sendMail({
      to: admin.email,
      subject: 'Welcome to Milliard Dev',
      template: 'confirm',
      context: {
        full_name: admin.full_name,
        url,
      },
    });
  }
}
