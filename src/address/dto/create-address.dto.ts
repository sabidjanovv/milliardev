import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, Matches } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    example: "Tver ko'chasi",
    description: 'Manzil nomi (masalan, Toshkent shahri)',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Kreml yonida',
    description: 'Manzilning qisqacha tavsifi',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: '+998901234567',
    description:
      "Telefon raqam, +998 bilan boshlanib, 9 ta raqamdan iborat bo'lishi kerak",
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+998\d{9}$/, {
    message:
      "Telefon raqam +998 bilan boshlanib, 9 ta raqamdan iborat bo'lishi kerak",
  })
  phone_number: string;

  @ApiProperty({
    example: '55.7558, 37.6173',
    description: 'Koordinatalar (kenglik, uzunlik)',
  })
  @IsString()
  @IsNotEmpty()
  latitude_altitude: string;
}
