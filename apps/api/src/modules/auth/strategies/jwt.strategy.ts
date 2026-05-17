import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../common/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret') || 'dev-access-secret',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null, isActive: true },
      select: {
        id: true,
        email: true,
        role: true,
        branchId: true,
        positionId: true,
        position: {
          select: {
            id: true,
            name: true,
            code: true,
            permissions: true,
            isActive: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const activePosition =
      user.position && user.position.isActive && !user.position.deletedAt
        ? user.position
        : null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      positionId: user.positionId,
      position: activePosition
        ? {
            id: activePosition.id,
            name: activePosition.name,
            code: activePosition.code,
          }
        : null,
      permissions: activePosition?.permissions || [],
    };
  }
}
