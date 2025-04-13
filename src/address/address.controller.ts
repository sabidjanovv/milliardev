import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminGuard } from '../common/guard/admin.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Addresses')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Yangi manzil yaratish' })
  @ApiResponse({
    status: 201,
    description: '✅ Manzil muvaffaqiyatli yaratildi',
  })
  @ApiResponse({ status: 400, description: '❌ Noto‘g‘ri so‘rov' })
  @ApiResponse({ status: 403, description: '❌ Faqat adminlar uchun ruxsat' })
  async create(@Body() createAddressDto: CreateAddressDto, @Request() req) {
    const adminId = req.user.id;
    return this.addressService.create(createAddressDto, adminId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Barcha manzillarni olish' })
  @ApiResponse({
    status: 200,
    description: '✅ Manzillar muvaffaqiyatli olindi',
  })
  @ApiResponse({ status: 403, description: '❌ Faqat adminlar uchun ruxsat' })
  async findAll() {
    return this.addressService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ID bo‘yicha manzilni olish' })
  @ApiParam({
    name: 'id',
    description: 'Manzilning ID raqami',
    example: '660b7c3e8f1a7e564c6d1c2f1',
  })
  @ApiResponse({ status: 200, description: '✅ Manzil topildi' })
  @ApiResponse({ status: 404, description: '❌ Manzil topilmadi' })
  @ApiResponse({ status: 403, description: '❌ Faqat adminlar uchun ruxsat' })
  async findOne(@Param('id') id: string) {
    return this.addressService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ID bo‘yicha manzilni yangilash' })
  @ApiParam({
    name: 'id',
    description: 'Yangilanishi kerak bo‘lgan manzil IDsi',
    example: '660b7c3e8f1a7e564c6d1c2f1',
  })
  @ApiResponse({ status: 200, description: '✅ Manzil yangilandi' })
  @ApiResponse({ status: 404, description: '❌ Manzil topilmadi' })
  @ApiResponse({ status: 403, description: '❌ Faqat adminlar uchun ruxsat' })
  async update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req, // Updater admin ID
  ) {
    const updaterAdminId = req.user.id;
    return this.addressService.update(id, updateAddressDto, updaterAdminId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ID bo‘yicha manzilni o‘chirish' })
  @ApiParam({
    name: 'id',
    description: 'O‘chiriladigan manzil IDsi',
    example: '660b7c3e8f1a7e564c6d1c2f1',
  })
  @ApiResponse({ status: 200, description: '✅ Manzil o‘chirildi' })
  @ApiResponse({ status: 404, description: '❌ Manzil topilmadi' })
  @ApiResponse({ status: 403, description: '❌ Faqat adminlar uchun ruxsat' })
  async remove(@Param('id') id: string) {
    return this.addressService.remove(id);
  }
}
