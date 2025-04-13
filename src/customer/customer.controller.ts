import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminGuard } from '../common/guard/admin.guard';
import { AuthGuard } from '@nestjs/passport';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('Customers') // Swagger guruh nomi
@ApiBearerAuth()
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Barcha mijozlarni olish
  @Get()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'Barcha mijozlarni olish' })
  @ApiResponse({ status: 200, description: 'Mijozlar muvaffaqiyatli olindi' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Sahifadagi mijozlar soni',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Sahifa raqami',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Boshlanish sanasi (yyyy-mm-dd)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'Tugash sanasi (yyyy-mm-dd)',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    type: String,
    description: 'Mijozning elektron pochta manzili',
  })
  @ApiQuery({
    name: 'phone_number',
    required: false,
    type: String,
    description: 'Mijozning telefon raqami',
  })
  async findAll(paginationDto: PaginationDto) {
    return this.customerService.findAll(paginationDto);
  }

  // ID bo‘yicha mijozni olish
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'ID bo‘yicha mijozni olish' })
  @ApiParam({ name: 'id', description: 'Mijozning ID raqami' })
  @ApiResponse({ status: 200, description: 'Mijoz topildi' })
  @ApiResponse({ status: 404, description: 'Mijoz topilmadi' })
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  // ID bo‘yicha mijozni yangilash
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'ID bo‘yicha mijozni yangilash' })
  @ApiParam({
    name: 'id',
    description: 'Yangilanishi kerak bo‘lgan mijoz IDsi',
  })
  @ApiResponse({ status: 200, description: 'Mijoz yangilandi' })
  @ApiResponse({ status: 404, description: 'Mijoz topilmadi' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(id, updateCustomerDto);
  }

  // ID bo‘yicha mijozni o‘chirish
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiOperation({ summary: 'ID bo‘yicha mijozni o‘chirish' })
  @ApiParam({ name: 'id', description: 'O‘chiriladigan mijoz IDsi' })
  @ApiResponse({ status: 200, description: 'Mijoz o‘chirildi' })
  @ApiResponse({ status: 404, description: 'Mijoz topilmadi' })
  async remove(@Param('id') id: string) {
    return this.customerService.remove(id);
  }
}
