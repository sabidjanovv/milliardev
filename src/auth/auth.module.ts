import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from '../admin/admin.module';
import { Admin, AdminSchema } from '../admin/schemas/admin.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from '../common/strategy/access-token.strategy';
import { RefreshTokenStrategy } from '../common/strategy/refresh-token.strategy';
import { JwtStrategy } from '../common/strategy/jwt.strategy';
import { RefreshTokenGuard } from '../common/guard/refresh-token.guard';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({ global: true }),
    AdminModule,
    MailModule,
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    JwtStrategy,
    RefreshTokenGuard
  ],
})
export class AuthModule {}
