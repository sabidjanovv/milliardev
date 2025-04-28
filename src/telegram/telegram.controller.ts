import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../project/schemas/project.schema';

@Controller('api/telegram')
export class TelegramController {
  constructor(
    private readonly telegramService: TelegramService,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  @Post('send-project-info')
  async sendProjectInfo(@Body() body: { userId: string; projectId: string }) {
    const { userId, projectId } = body;

    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new Error('Proyekt topilmadi');
    }

    await this.telegramService.sendProjectToUser(userId, project);
    return { success: true };
  }
}
