import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
//7832296528:AAGtHbdLHRRNIIaLh7rsmIYVIYDNpTmZvWs
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
