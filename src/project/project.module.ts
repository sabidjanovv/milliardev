import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { Project, ProjectSchema } from './schemas/project.schema';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
