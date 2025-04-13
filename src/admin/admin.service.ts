import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Admin, AdminDocument } from './schemas/admin.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { hash } from 'argon2';
import { ApiTags } from '@nestjs/swagger';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as uuid from 'uuid';
import { MailService } from '../mail/mail.service';
import { Response } from 'express';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createApiResponse } from '../common/utils/api-response';

@ApiTags('Admin')
@Injectable()
export class AdminService {
  private isCreatorChecked = false;

  constructor(
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
  ) {}

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

  async create(createAdminDto: CreateAdminDto) {
    const { email, phone_number, password } = createAdminDto;

    const existsAdmin = await this.adminModel.findOne({
      $or: [{ email }, { phone_number }],
    });

    if (existsAdmin) {
      throw new BadRequestException('Bunday email yoki telefon raqami mavjud!');
    }

    const hashedPassword = await hash(password);

    let is_creator = false;

    if (!this.isCreatorChecked) {
      const creatorAdmin = await this.adminModel.findOne({ is_creator: true });
      is_creator = !creatorAdmin;
      this.isCreatorChecked = true;
    }

    const activation_link = uuid.v4();
    const newAdmin = new this.adminModel({
      ...createAdminDto,
      hashed_password: hashedPassword,
      is_creator,
      activation_link,
    });

    await newAdmin.save();

    try {
      await this.mailService.sendMail(newAdmin);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        'Aktivatsiya xatini yuborishda xatolik yuz berdi',
      );
    }

    const { refresh_token } = await this.generateTokens(newAdmin);
    newAdmin.hashed_refresh_token = await hash(refresh_token);

    await newAdmin.save();
    return createApiResponse(200, 'Admin muvaffaqiyatli yaratildi', newAdmin);
  }

  async findAll(paginationDto: PaginationDto, adminId: string) {
    const limit = Number(paginationDto.limit ?? 10);
    const page = Number(paginationDto.page ?? 1);
    const { email, phone_number, fromDate, toDate } = paginationDto;

    const filter: any = {};
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (phone_number)
      filter.phone_number = { $regex: phone_number, $options: 'i' };

    if (fromDate || toDate) {
      if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
        throw new BadRequestException(
          'fromDate formati noto‘g‘ri. YYYY-MM-DD formatida bo‘lishi kerak',
        );
      }
      if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        throw new BadRequestException(
          'toDate formati noto‘g‘ri. YYYY-MM-DD formatida bo‘lishi kerak',
        );
      }

      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = `${fromDate} 00:00:00`;
      if (toDate) filter.createdAt.$lte = `${toDate} 23:59:59`;
    }

    const [admins, totalCount] = await Promise.all([
      this.adminModel
        .find(filter)
        .sort({ _id: 'desc' })
        .limit(limit)
        .skip((page - 1) * limit),
      this.adminModel.countDocuments(filter),
    ]);

    const filteredAdmins = admins.filter(
      (admin) => admin._id.toString() !== adminId,
    );

    return createApiResponse(200, 'Adminlar muvaffaqiyatli olindi', {
      payload: filteredAdmins,
      total: totalCount,
      limit,
      page,
    });
  }

  async findOne(id: string) {
    const admin = await this.adminModel.findById(id);

    if (!admin) {
      throw new NotFoundException('Admin topilmadi');
    }

    return createApiResponse(200, 'Admin topildi', admin);
  }

  async update(id: string, updateAdminDto: UpdateAdminDto) {
    const admin = await this.adminModel.findById(id);

    if (!admin) {
      throw new BadRequestException('Admin topilmadi');
    }

    const updatedAdmin = await this.adminModel.findByIdAndUpdate(
      id,
      updateAdminDto,
      {
        new: true,
      },
    );

    return createApiResponse(
      200,
      'Admin muvaffaqiyatli yangilandi',
      updatedAdmin,
    );
  }

  async remove(id: string) {
    const admin = await this.adminModel.findById(id);

    if (!admin) {
      throw new BadRequestException('Admin topilmadi');
    }

    await this.adminModel.findByIdAndDelete(id);
    return createApiResponse(200, 'Admin muvaffaqiyatli o‘chirildi', null);
  }

  async activateAdmin(link: string, res: Response) {
    try {
      const admin = await this.adminModel.findOne({ activation_link: link });

      if (!admin) {
        return res.status(400).send({ message: 'Admin topilmadi!' });
      }

      if (admin.is_active) {
        return res
          .status(400)
          .send({ message: 'Admin allaqachon aktivlashtirilgan.' });
      }

      admin.is_active = true;
      await admin.save();

      return res.send({
        is_active: admin.is_active,
        message: 'Admin muvaffaqiyatli aktivlashtirildi.',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: 'Serverda xatolik yuz berdi' });
    }
  }
}
