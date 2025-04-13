import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

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
  @IsNotEmpty({ message: 'Loyiha havolasi majburiy' })
  @IsUrl({}, { message: "Havola to'g'ri URL formatida bo'lishi kerak" })
  link: string;

  @ApiProperty({
    description: 'Loyihaning rasmi',
    type: 'string',
    format: 'binary', // Swagger-specific to indicate a file upload
  })
  image?: string;
}
