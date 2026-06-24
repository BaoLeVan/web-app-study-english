import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import type { ForgotPasswordDto, LoginDto, RegisterDto } from '@repo/types';
import { PrismaService } from '../../prisma/prisma.service';

const REFRESH_TTL_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        settings: { create: {} },
        progress: { create: {} },
      },
    });
    return this.issueTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.email);
  }

  /**
   * Rotate refresh tokens: validate the incoming token against its DB hash,
   * delete it, then issue a fresh pair. A stolen refresh token therefore
   * becomes useless the moment the legitimate owner refreshes.
   */
  async refresh(refreshToken: string) {
    let payload: { sub: string; email: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = await argon2.hash(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { userId: payload.sub, expiresAt: { gt: new Date() } },
    });
    if (!stored || !(await argon2.verify(stored.tokenHash, refreshToken))) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    void tokenHash; // silence unused
    return this.issueTokens(payload.sub, payload.email);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { ok: true };
  }

  /**
   * Forgot-password stub. Real implementation would mint a single-use reset
   * token and email a link. We deliberately return 200 regardless of whether
   * the email exists, to avoid leaking which addresses are registered.
   */
  async forgotPassword(_dto: ForgotPasswordDto) {
    return { ok: true };
  }

  private async issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: '15m' });
    const refreshToken = await this.jwt.signAsync(payload, { expiresIn: `${REFRESH_TTL_DAYS}d` });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TTL_DAYS);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash: await argon2.hash(refreshToken), expiresAt },
    });

    return { accessToken, refreshToken, user: { id: userId, email } };
  }
}
