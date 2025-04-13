import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createApiResponse } from '../common/utils/api-response';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {}

  // Yangi mijoz qo'shish
  async create(createCustomerDto: CreateCustomerDto) {
    const newCustomer = await this.customerModel.create(createCustomerDto);
    return createApiResponse(201, 'Mijoz muvaffaqiyatli yaratildi', {
      payload: newCustomer,
    });
  }

  // Barcha mijozlarni olish
  async findAll(paginationDto: PaginationDto) {
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

    const [customers, totalCount] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort({ _id: 'desc' })
        .limit(limit)
        .skip((page - 1) * limit),
      this.customerModel.countDocuments(filter),
    ]);

    return createApiResponse(200, "Mijozlar ro'yxati muvaffaqiyatli olingan", {
      payload: customers,
      total: totalCount,
      limit,
      page,
    });
  }

  // ID bo'yicha mijozni olish
  async findOne(id: string) {
    const customer = await this.customerModel.findById(id).exec();
    if (!customer)
      throw new NotFoundException(`ID ${id} bo'yicha mijoz topilmadi`);
    return createApiResponse(200, 'Mijoz muvaffaqiyatli topildi', {
      payload: customer,
    });
  }

  // Mijoz ma'lumotlarini yangilash
  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const updatedCustomer = await this.customerModel
      .findByIdAndUpdate(id, updateCustomerDto, {
        new: true,
        runValidators: true,
      })
      .exec();
    if (!updatedCustomer)
      throw new NotFoundException(`ID ${id} bo'yicha mijoz topilmadi`);
    return createApiResponse(200, 'Mijoz muvaffaqiyatli yangilandi', {
      payload: updatedCustomer,
    });
  }

  // Mijozni o'chirish
  async remove(id: string) {
    const deletedCustomer = await this.customerModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedCustomer)
      throw new NotFoundException(`ID ${id} bo'yicha mijoz topilmadi`);
    return createApiResponse(200, "Mijoz muvaffaqiyatli o'chirildi", {
      payload: deletedCustomer,
    });
  }
}
