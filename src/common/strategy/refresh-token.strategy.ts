import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types/jwt-payload.type';
import { Request } from 'express';
import { AdminService } from '../../admin/admin.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(private readonly adminService: AdminService) {
    super({
      jwtFromRequest: (req: Request) => {
        console.log('REQUEST HEADERS:', req.headers);

        if (!req.headers.authorization) {
          console.log('AUTHORIZATION HEADER YO‘Q');
          return null;
        }

        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
          console.log('TOKEN TOPILMADI');
          return null;
        }

        console.log('TOKEN OLINDI:', token);
        return token;
      },
      secretOrKey: process.env.REFRESH_TOKEN_KEY || 'refresh-token-key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    console.log('STRATEGY VALIDATE BOSHLANDI', payload);

    if (!payload || !payload.id) {
      throw new ForbiddenException('Invalid token');
    }

    const user = await this.adminService.findOne(payload.id);
    console.log('STRATEGY USER:', user);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new ForbiddenException('Authorization header missing');
    }

    const refreshToken = authHeader.split(' ')[1];

    if (!refreshToken) {
      throw new ForbiddenException('Refresh token missing');
    }

    return { ...payload, refreshToken };
  }
}
