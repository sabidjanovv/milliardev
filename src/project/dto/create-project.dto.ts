import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Ajoyib Loyihalar', description: 'Loyiha nomi' })
  @IsNotEmpty({ message: 'Loyiha nomi majburiy' })
  @IsString({ message: "Loyiha nomi satr bo'lishi kerak" })
  name: string;

  @ApiProperty({
    example: 'Bu juda ajoyib loyiha',
    description: 'Loyihaning tavsifi',
  })
  @IsNotEmpty({ message: 'Loyihaning tavsifi majburiy' })
  @IsString({ message: "Tavsif satr bo'lishi kerak" })
  description: string;

  @ApiProperty({
    example: 'https://github.com/awesome-project',
    description: 'Loyiha havolasi',
  })
  @IsOptional()
  link?: string;

  @ApiProperty({
    description: 'Loyihaning rasmi',
    type: 'string',
    format: 'binary', // Swagger-specific to indicate a file upload
  })
  @IsOptional()
  image?: string;

  @ApiProperty({
    example: 'bdjhawe2dbq23',
    description: 'Loyiha qaysi mijozga tegishliligini bilish uchun ID kerak',
  })
  @IsNotEmpty({
    message:
      "Loyiha qaysi mijozga tegishliligini bilish uchun mijoz ID'sini kiriting",
  })
  @IsString({ message: "Tavsif satr bo'lishi kerak" })
  customerId?: string;
}
