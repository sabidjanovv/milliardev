import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    example: 'Admin',
    description: 'Adminning ismi',
  })
  @IsString({ message: 'Isming satr bo‘lishi kerak' })
  full_name: string;
  @ApiProperty({
    example: 'admin@gmail.com',
    description: 'Adminning email manzili',
  })
  @IsEmail({}, { message: 'Noto‘g‘ri email formati' })
  email: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Adminning telefon raqami',
  })
  @IsString({ message: 'Telefon raqam satr bo‘lishi kerak' })
  phone_number: string;

  @ApiProperty({ example: 'StrongPass123', description: 'Adminning paroli' })
  @IsString({ message: 'Parol satr bo‘lishi kerak' })
  @MinLength(6, { message: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak' })
  password: string;
}
