import { Body, Controller, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from 'nestjs-zod';
import { z } from 'zod';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  type ForgotPasswordDto,
  type LoginDto,
  type RegisterDto,
} from '@repo/types';
import { AuthService } from './auth.service';

const RefreshSchema = z.object({ refreshToken: z.string().min(10) });

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @UsePipes(new ZodValidationPipe(RefreshSchema))
  refresh(@Body() dto: { refreshToken: string }) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  logout(@Req() req: { user: { userId: string } }) {
    return this.auth.logout(req.user.userId);
  }

  @Post('forgot-password')
  @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }
}
