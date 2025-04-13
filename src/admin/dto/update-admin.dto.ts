import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAdminDto } from './create-admin.dto';
import { IsBoolean } from 'class-validator';

export class UpdateAdminDto extends PartialType(CreateAdminDto) {
  @ApiProperty({ example: false, description: "Adminning Creator'ligi" })
  @IsBoolean()
  is_creator?: string;
}
