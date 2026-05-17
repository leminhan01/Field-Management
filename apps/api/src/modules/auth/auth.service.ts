import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        phone: dto.phone,
        role: dto.role || 'STAFF',
        branchId: dto.branchId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        branchId: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokens: [...(user.refreshTokens || []), tokens.refreshToken] },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        branchId: user.branchId,
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret') || 'dev-refresh-secret',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub, deletedAt: null },
      });

      if (!user || !user.refreshTokens.includes(dto.refreshToken)) {
        throw new UnauthorizedException();
      }

      // Rotate refresh token
      const filteredTokens = user.refreshTokens.filter((t) => t !== dto.refreshToken);
      const newTokens = await this.generateTokens(user.id, user.email, user.role);
      filteredTokens.push(newTokens.refreshToken);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokens: filteredTokens },
      });

      return {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (!refreshToken) return;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const filteredTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokens: filteredTokens },
      });
    }
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        avatar: true,
        branchId: true,
        isActive: true,
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, refreshTokens: [] },
    });

    return { message: 'Password changed successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessSecret = this.config.get<string>('jwt.accessSecret') || 'dev-access-secret';
    const refreshSecret = this.config.get<string>('jwt.refreshSecret') || 'dev-refresh-secret';
    const accessExpiry = this.config.get<string>('jwt.accessExpiry') || '15m';
    const refreshExpiry = this.config.get<string>('jwt.refreshExpiry') || '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: accessSecret, expiresIn: accessExpiry as any },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        { secret: refreshSecret, expiresIn: refreshExpiry as any },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
