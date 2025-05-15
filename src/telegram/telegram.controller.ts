import { Controller, Post, Body, NotFoundException } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../project/schemas/project.schema';
import { SendProjectInfoDto } from './dto/telegram.dto'; 

@Controller('api/telegram')
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  @Post('send-project-info')
  async sendProjectInfo(@Body() body: SendProjectInfoDto) {
    const { userId, projectId } = body;

    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Proyekt topilmadi');
    }

    await this.telegramService.sendProjectToUser(userId, project);
    return { success: true };
  }
}
