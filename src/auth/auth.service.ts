import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
// import { CreateAdminDto } from '../user/dto/create-user.dto';
// import { User, UserDocument } from '../user/schemas/user.schemas';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { JwtService } from '@nestjs/jwt';
import { createApiResponse } from '../common/utils/api-response';
import { hash, verify } from 'argon2';
import { SignInDto } from './dto/signin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import '../common/types/request.types';
import { AdminService } from '../admin/admin.service';
import { Admin, AdminDocument } from '../admin/schemas/admin.schema';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import * as uuid from 'uuid';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private isCreatorChecked = false;
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
  ) {}

  async signUp(createAdminDto: CreateAdminDto, adminId: string) {
    // 1. Email mavjudligini tekshiramiz
    const existingAdmin = await this.adminModel.findOne({
      email: createAdminDto.email,
    });

    if (existingAdmin) {
      throw new BadRequestException(
        'Bu email orqali allaqachon ro‘yxatdan o‘tilgan',
      );
    }

    // 2. Yangi admin yaratamiz
    const admin = new this.adminModel({
      ...createAdminDto,
      adminId,
    });

    const hashedPassword = await hash(createAdminDto.password);

    const { access_token, refresh_token } = await this.generateTokens(admin);
    const hashedRefreshtoken = await hash(refresh_token);
    const activation_link = uuid.v4();

    admin.hashed_refresh_token = hashedRefreshtoken;
    admin.hashed_password = hashedPassword;
    admin.activation_link = activation_link;

    let is_creator = false;
    if (!this.isCreatorChecked) {
      const creatorAdmin = await this.adminModel.findOne({ is_creator: true });
      is_creator = !creatorAdmin;
      this.isCreatorChecked = true;
    }
    admin.is_creator = is_creator;

    // 3. Saqlash
    await admin.save();

    const admin_data = {
      id: admin._id,
      full_name: admin.full_name,
      phone_number: admin.phone_number,
      email: admin.email,
    };

    try {
      await this.mailService.sendMail(admin);
    } catch (error) {
      console.log("Mail ERROR:",error);
      throw new BadRequestException(
        `Aktivatsiya xatini yuborishda xatolik yuz berdi: ${error}`,
      );
    }

    return createApiResponse(
      201,
      `${admin.email} emailga yuborilgan link orqali tasdiqlang`,
      {
        payload: admin_data,
      },
    );
  }

  async generateTokens(admin: Admin) {
    const payload: JwtPayload = {
      id: admin._id,
      full_name: admin.full_name,
      is_active: admin.is_active,
      is_creator: admin.is_creator,
      email: admin.email,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),

      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);

    return { access_token, refresh_token };
  }

  async signIn(signInDto: SignInDto) {
    const admin = await this.adminModel.findOne({ email: signInDto.email });

    if (!admin) {
      throw new BadRequestException("Foydalanuvchi nomi yoki parol noto'g'ri");
    }

    if (!admin.is_active) {
      throw new ForbiddenException('Foydalanuvchi faol emas');
    }

    const validPassword = await verify(
      admin.hashed_password,
      signInDto.password,
    );
    if (!validPassword) {
      throw new BadRequestException("Foydalanuvchi nomi yoki parol noto'g'ri");
    }

    const { access_token, refresh_token } = await this.generateTokens(admin);

    admin.hashed_refresh_token = await hash(refresh_token);
    await admin.save();

    return createApiResponse(200, 'Tizimga muvaffaqiyatli kirildi', {
      access_token,
      id: admin._id,
      email: admin.email,
    });
  }

  async signOut(adminId: string) {
    const admin = await this.adminModel.findById(adminId);
    if (!admin || !admin.hashed_refresh_token) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }

    admin.hashed_refresh_token = '';
    await admin.save();
    return createApiResponse(200, 'Tizimdan muvaffaqiyatli chiqildi');
  }

  async refreshTokens(req: Request) {
    const adminPayload = req?.user as JwtPayload;
    // console.log('PAYLOAD:', adminPayload);

    if (!adminPayload.id) {
      throw new ForbiddenException("Foydalanuvchi ID-si noto'g'ri");
    }

    const admin = await this.adminModel.findById(adminPayload.id);
    if (!admin || !admin.hashed_refresh_token) {
      throw new ForbiddenException('Kirish rad etildi');
    }

    if (!adminPayload.refreshToken) {
      throw new ForbiddenException('Yangilash tokeni topilmadi');
    }

    const isMatch = await verify(
      admin.hashed_refresh_token,
      adminPayload.refreshToken,
    );

    if (!isMatch) {
      throw new ForbiddenException("Noto'g'ri yangilash tokeni");
    }

    const { access_token, refresh_token: newRefreshToken } =
      await this.generateTokens(admin);

    admin.hashed_refresh_token = await hash(newRefreshToken);
    await admin.save();

    return {
      status: 200,
      message: 'Tokenlar muvaffaqiyatli yangilandi',
      data: {
        access_token,
        id: admin._id,
        refresh_token: newRefreshToken,
      },
    };
  }

  async profileCheck(access_token: string) {
    try {
      const verified_token = await this.jwtService.verify(access_token, {
        secret: process.env.ACCESS_TOKEN_KEY,
      });

      if (!verified_token) {
        throw new UnauthorizedException("Berilgan token noto'g'ri");
      }

      const user = await this.adminModel.findById(verified_token.id);

      if (!user) {
        throw new UnauthorizedException(
          'Berilgan token bilan foydalanuvchi topilmadi',
        );
      }

      return {
        success: true,
        message: 'Foydalanuvchi profili muvaffaqiyatli tekshirildi',
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          is_active: user.is_active,
          is_creator: user.is_creator,
          phone_number: user.phone_number,
        },
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token muddati tugagan');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException("Token imzosi noto'g'ri");
      } else {
        throw new UnauthorizedException(
          'Autentifikatsiya muvaffaqiyatsiz tugadi',
        );
      }
    }
  }
}
