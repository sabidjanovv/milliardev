import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Foydalanuvchining elektron pochtasi',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'p@ssw0rd',
    description: 'Foydalanuvchi paroli',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
