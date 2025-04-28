import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateServiceDto {
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
    description: 'Loyihaning rasmi',
    type: 'string',
    format: 'binary', // Swagger-specific to indicate a file upload
  })
  @IsOptional()
  image?: string;
}
