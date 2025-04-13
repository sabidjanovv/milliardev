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
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly adminService: AdminService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_KEY || 'access_token_key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    if (!payload || !payload.id) {
      throw new ForbiddenException('Invalid token');
    }
    const user = await this.adminService.findOne(payload.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return payload;
  }
}
