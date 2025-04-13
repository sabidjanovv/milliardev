import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { createApiResponse } from '../common/utils/api-response';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    adminId: string,
    file?: Express.Multer.File,
  ) {
    if (file) {
      createProjectDto['image'] = file.filename; // Faylni saqlash
    }

    const project = new this.projectModel(createProjectDto);
    project.adminId = adminId; // Admin ID ni saqlash
    await project.save(); // Loyiha saqlash

    return createApiResponse(201, 'Proyekt muvaffaqiyatli yaratildi', {
      payload: project,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const limit = paginationDto.limit ?? 20;
    const page = paginationDto.page ?? 1;
    const fromDate = paginationDto.fromDate;
    const toDate = paginationDto.toDate;
    const filter: any = {};

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
    const totalCount = await this.projectModel.countDocuments(filter);
    const projects = await this.projectModel
      .find(filter)
      .sort({ _id: 'desc' })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    return createApiResponse(200, "Barcha proyektlar ro'yxati", {
      payload: projects,
      total: totalCount,
      limit,
      page,
    });
  }

  async findOne(id: string) {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException("Berilgan ID bo'yicha proyekt topilmadi");
    }
    return createApiResponse(200, 'Proyekt topildi', {
      payload: project,
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, adminId: string) {
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .exec();

    if (!updatedProject) {
      throw new NotFoundException("Berilgan ID bo'yicha proyekt topilmadi");
    }

    updatedProject.updaterAdminId = adminId;
    updatedProject.save();

    return createApiResponse(200, 'Proyekt muvaffaqiyatli yangilandi', {
      payload: updatedProject,
    });
  }

  async remove(id: string) {
    const deletedProject = await this.projectModel.findByIdAndDelete(id).exec();
    if (!deletedProject) {
      throw new NotFoundException("Berilgan ID bo'yicha proyekt topilmadi");
    }
    return createApiResponse(200, "Proyekt muvaffaqiyatli o'chirildi", {
      payload: deletedProject, // yoki agar hech narsa qaytarilmasa: payload: null
    });
  }
}
