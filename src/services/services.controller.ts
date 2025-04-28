import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Request,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../common/guard/admin.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Loyiha yaratish' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Yuklash papkasi
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname); // Fayl kengaytmasini olish
          callback(null, `${uniqueSuffix}${ext}`); // Yagona fayl nomini saqlash
        },
      }),
    }),
  )
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createServiceDto.image = file.filename; // Fayl nomini DTOga saqlash
    }
    const adminId = req.user.id;
    return this.servicesService.create(createServiceDto, adminId, file); // Admin ID bilan serviceni yaratish
  }

  @Get()
  @ApiOperation({ summary: 'Barcha servicelarni olish' })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: 'Bu sanadan boshlab servicelarni filtrlash (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    description: 'Bu sanagacha servicelarni filtrlash (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Sahifa raqami (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Sahifadagi elementlar soni (default: 20)',
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.servicesService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID bo‘yicha serviceni olish' })
  @ApiParam({ name: 'id', type: 'string' })
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ID bo‘yicha serviceni yangilash' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiConsumes('multipart/form-data') // Form ma’lumotlarini (shu jumladan fayllar) boshqarish uchun muhim
  @ApiBody({
    description: "serviceni yangilash va rasm qo'shish",
    type: UpdateServiceDto,
    required: false, // Rasm ixtiyoriy
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Yuklash papkasi
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname); // Fayl kengaytmasini olish
          callback(null, `${uniqueSuffix}${ext}`); // Yagona fayl nomini saqlash
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const existingService = await this.servicesService.findOne(id);

    if (!existingService) {
      throw new NotFoundException('Bunday IDga ega loyiha topilmadi');
    }

    if (file) {
      if (existingService.data?.payload.image) {
        const oldImagePath = `./uploads/${existingService.data.payload.image}`;
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        } else {
          console.log('Fayl topilmadi:', oldImagePath);
        }
      }
      updateServiceDto.image = file.filename;
    }

    const adminId = req.user.id;

    return this.servicesService.update(id, updateServiceDto, adminId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ID bo‘yicha serviceni o‘chirish' })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
