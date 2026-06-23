import { Body, Controller, Get, Patch, Req, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { UpdateSettingsSchema, type UpdateSettingsDto } from '@repo/types';
import { UsersService } from './users.service';

interface AuthedRequest {
  user: { userId: string; email: string };
}

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.users.getProfile(req.user.userId);
  }

  @Patch('me/settings')
  @UsePipes(new ZodValidationPipe(UpdateSettingsSchema))
  updateSettings(@Req() req: AuthedRequest, @Body() dto: UpdateSettingsDto) {
    return this.users.updateSettings(req.user.userId, dto);
  }
}
