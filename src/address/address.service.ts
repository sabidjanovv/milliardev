import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from './schemas/address.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { ApiResponse } from '../common/types/api-response.type';
import { createApiResponse } from '../common/utils/api-response';

@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {}

  // ✅ Yangi manzil yaratish
  async create(
    createAddressDto: CreateAddressDto,
    adminId: string,
  ): Promise<ApiResponse<Address>> {
    const newAddress = await this.addressModel.create(createAddressDto);
    return createApiResponse(
      201,
      'Manzil muvaffaqiyatli yaratildi',
      newAddress,
    );
  }

  // ✅ Barcha manzillar ro‘yxatini olish
  async findAll(): Promise<ApiResponse<Address[]>> {
    const addresses = await this.addressModel.find().exec();
    return createApiResponse(
      200,
      'Barcha manzillar muvaffaqiyatli olindi',
      addresses,
    );
  }

  // ✅ ID bo‘yicha manzilni olish
  async findOne(id: string): Promise<ApiResponse<Address>> {
    const address = await this.addressModel.findById(id).exec();

    if (!address) {
      throw new NotFoundException('Bunday IDga ega manzil topilmadi');
    }

    return createApiResponse(200, 'Manzil topildi', address);
  }

  // ✅ ID bo‘yicha manzilni yangilash
  async update(
    id: string,
    updateAddressDto: UpdateAddressDto,
    updaterAdminId: string, // Updater admin ID
  ): Promise<ApiResponse<Address>> {
    // Yangilashda updaterAdminIdni manzilga qo'shish
    const updatedAddress = await this.addressModel
      .findByIdAndUpdate(
        id,
        {
          ...updateAddressDto,
          updaterAdminId, // yangi admin IDni qo'shish
        },
        { new: true },
      )
      .exec();

    if (!updatedAddress) {
      throw new NotFoundException(
        'Yangilanishi kerak bo‘lgan manzil topilmadi',
      );
    }

    return createApiResponse(
      200,
      'Manzil muvaffaqiyatli yangilandi',
      updatedAddress,
    );
  }

  // ✅ ID bo‘yicha manzilni o‘chirish
  async remove(id: string): Promise<ApiResponse<null>> {
    const deletedAddress = await this.addressModel.findByIdAndDelete(id).exec();

    if (!deletedAddress) {
      throw new NotFoundException('O‘chiriladigan manzil topilmadi');
    }

    return createApiResponse(200, 'Manzil muvaffaqiyatli o‘chirildi', null);
  }
}
