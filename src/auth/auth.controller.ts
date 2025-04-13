import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  Param,
  Req,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { Request } from 'express';
import { CreateAdminDto } from '../admin/dto/create-admin.dto';
import { JwtGuard } from '../common/guard/jwt.guard';
import { RefreshTokenGuard } from '../common/guard/refresh-token.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Foydalanuvchini ro‘yxatdan o‘tkazish' })
  @ApiResponse({
    status: 201,
    description: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi',
  })
  @ApiResponse({ status: 400, description: 'Noto‘g‘ri so‘rov' })
  signUp(@Body() createAuthDto: CreateAdminDto) {
    const adminId = '';
    return this.authService.signUp(createAuthDto, adminId);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Foydalanuvchini tizimga kirishi' })
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchi tizimga muvaffaqiyatli kirdi',
  })
  @ApiResponse({ status: 401, description: 'Ruxsat berilmadi' })
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('signout/:id')
  @ApiOperation({ summary: 'Foydalanuvchini tizimdan chiqishi' })
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchi tizimdan muvaffaqiyatli chiqdi',
  })
  @ApiResponse({ status: 400, description: 'Noto‘g‘ri so‘rov' })
  @ApiParam({
    name: 'id',
    description: 'Foydalanuvchi ID sini kiriting',
    example: 'jfdlkafdsa',
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Param('id') userId: string) {
    return this.authService.signOut(userId);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Yangi token olish (refresh)' })
  @ApiResponse({ status: 200, description: 'Token yangilandi' })
  @ApiResponse({ status: 401, description: 'Ruxsat berilmadi' })
  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(@Req() req: Request) {
    // console.log('REFRESH TOKEN REQUEST:', req.user);
    return this.authService.refreshTokens(req);
  }

  @Get('/profile')
  @ApiOperation({ summary: 'Foydalanuvchi profilini olish' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchi profili' })
  @ApiResponse({ status: 401, description: 'Token yo‘q yoki noto‘g‘ri' })
  @ApiBearerAuth()
  async profileCheck(@Headers('authorization') authorization: string) {
    if (!authorization || !authorization.startsWith('Bearer')) {
      throw new UnauthorizedException('Avtorizatsiya tokeni taqdim etilmagan');
    }
    const access_token = authorization.split(' ')[1];
    return await this.authService.profileCheck(access_token);
  }
}
