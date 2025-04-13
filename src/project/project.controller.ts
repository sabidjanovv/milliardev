import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import * as path from 'path';
import * as fs from 'fs'; // fs modulini import qilish
import { PaginationDto } from '../common/dto/pagination.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../common/guard/admin.guard';

@ApiTags('Projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), AdminGuard) // JWT autentifikatsiyasi
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Loyiha yaratish' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        link: { type: 'string' },
        developerId: { type: 'string' },
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
    @Body() createProjectDto: CreateProjectDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createProjectDto.image = file.filename; // Fayl nomini DTOga saqlash
    }
    const adminId = req.user.id; // Admin IDni olish
    return this.projectService.create(createProjectDto, adminId, file); // Admin ID bilan loyihani yaratish
  }

  @Get()
  @ApiOperation({ summary: 'Barcha loyihalarni olish' })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: 'Bu sanadan boshlab loyihalarni filtrlash (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    description: 'Bu sanagacha loyihalarni filtrlash (YYYY-MM-DD)',
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
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.projectService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ID bo‘yicha loyihani olish' })
  @ApiParam({ name: 'id', type: 'string' })
  async findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard) // JWT autentifikatsiyasi
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ID bo‘yicha loyihani yangilash' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiConsumes('multipart/form-data') // Form ma’lumotlarini (shu jumladan fayllar) boshqarish uchun muhim
  @ApiBody({
    description: "Loyihani yangilash va rasm qo'shish",
    type: UpdateProjectDto,
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
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Mavjud loyihani olish
    const existingProject = await this.projectService.findOne(id);

    // Loyihaning mavjud emasligini tekshirish
    if (!existingProject) {
      throw new NotFoundException('Bunday IDga ega loyiha topilmadi');
    }

    // Agar eski rasm bo‘lsa, uni o‘chirish
    if (existingProject.data?.payload.image) {
      const oldImagePath = `./uploads/${existingProject.data.payload.image}`;
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Eski rasmini o‘chirish
      } else {
        console.log('Fayl topilmadi:', oldImagePath);
      }
    }

    // Yangi rasm yuklangan bo‘lsa, uni saqlash
    if (file) {
      updateProjectDto['image'] = file.filename; // Faqat fayl nomini saqlash
    } else {
      // Yangi rasm yuklanmasa, eski rasmani saqlash
      updateProjectDto['image'] = existingProject.data?.payload.image;
    }
    // Admin IDni olish
    const adminId = req.user.id; // Admin IDni olish

    return this.projectService.update(id, updateProjectDto, adminId); // Yangilash uchun servisga yuborish
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), AdminGuard) // JWT autentifikatsiyasi
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ID bo‘yicha loyihani o‘chirish' })
  @ApiParam({ name: 'id', type: 'string' })
  async remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
