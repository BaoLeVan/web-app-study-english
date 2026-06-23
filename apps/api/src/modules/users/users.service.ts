import { Injectable, NotFoundException } from '@nestjs/common';
import type { UpdateSettingsDto } from '@repo/types';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        settings: true,
        progress: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  updateSettings(userId: string, dto: UpdateSettingsDto) {
    return this.prisma.userSettings.update({
      where: { userId },
      data: dto,
    });
  }
}
