import { IsString } from 'class-validator';

export class SendProjectInfoDto {
  @IsString()
  userId: string;

  @IsString()
  projectId: string;
}
