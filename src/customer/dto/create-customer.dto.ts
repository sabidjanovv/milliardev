import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsPhoneNumber,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  username: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tg_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  first_name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  last_name: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({ default: 'ru' })
  @IsOptional()
  @IsEnum(['ru', 'en', 'uz'])
  lang: string;
}
