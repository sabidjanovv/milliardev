import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { createApiResponse } from '../common/utils/api-response';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { Model } from 'mongoose';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}
  async create(
    createServiceDto: CreateServiceDto,
    adminId: string,
    file?: Express.Multer.File,
  ) {
    if (file) {
      createServiceDto['image'] = file.filename; // Faylni saqlash
    }

    const service = new this.serviceModel(createServiceDto);
    service.adminId = adminId; // Admin ID ni saqlash
    await service.save(); // Loyiha saqlash

    return createApiResponse(201, 'Hizmat muvaffaqiyatli yaratildi', {
      payload: service,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const limit = paginationDto.limit ?? 20;
    const page = paginationDto.page ?? 1;
    const fromDate = paginationDto.fromDate;
    const toDate = paginationDto.toDate;
    const filter: any = {};

    // fromDate va toDate tekshirish
    if (fromDate || toDate) {
      if (fromDate && !/^\d{4}-\d{2}-\d{2}$/.test(fromDate)) {
        throw new BadRequestException(
          'fromDate format xato. Iltimos YYYY-MM-DD shaklida kiriting',
        );
      }
      if (toDate && !/^\d{4}-\d{2}-\d{2}$/.test(toDate)) {
        throw new BadRequestException(
          'toDate format xato. Iltimos YYYY-MM-DD shaklida kiriting',
        );
      }

      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = `${fromDate} 00:00:00`;
      if (toDate) filter.createdAt.$lte = `${toDate} 23:59:59`;
    }

    const totalCount = await this.serviceModel.countDocuments(filter);
    const services = await this.serviceModel
      .find(filter)
      .sort({ _id: 'desc' })
      .populate('adminId', 'full_name tel_primary email')
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    return createApiResponse(200, "Barcha servicelar ro'yxati", {
      payload: services,
      total: totalCount,
      limit,
      page,
    });
  }

  async findOne(id: string) {
    const service = await this.serviceModel.findById(id).exec();
    if (!service) {
      throw new NotFoundException("Berilgan ID bo'yicha proyekt topilmadi");
    }
    return createApiResponse(200, 'Proyekt topildi', {
      payload: service,
    });
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
    adminId: string,
  ) {
    const updatedService = await this.serviceModel
      .findByIdAndUpdate(id, updateServiceDto, { new: true })
      .exec();

    if (!updatedService) {
      throw new NotFoundException("Berilgan ID bo'yicha proyekt topilmadi");
    }

    await updatedService.save();

    return createApiResponse(200, 'Proyekt muvaffaqiyatli yangilandi', {
      payload: updatedService,
    });
  }

  async remove(id: string) {
    const deletedService = await this.serviceModel.findByIdAndDelete(id).exec();
    if (!deletedService) {
      throw new NotFoundException("Berilgan ID bo'yicha proyekt topilmadi");
    }
    return createApiResponse(200, "Proyekt muvaffaqiyatli o'chirildi", {
      payload: deletedService, 
    });
  }
}
