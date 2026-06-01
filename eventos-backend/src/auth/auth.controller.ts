import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    // Set refresh token as httpOnly cookie
    const refreshToken = result.refresh_token;
    const isProd = process.env.NODE_ENV === 'production';
    const maxAge = Number(process.env.JWT_REFRESH_EXPIRES_MS) || 7 * 24 * 60 * 60 * 1000; // 7 days
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge,
    });

    // don't expose refresh token in body
    const { refresh_token, ...body } = result as any;
    return body;
  }

  @Post('refresh')
  refresh(@Req() req: Request) {
    const cookieHeader = req.headers?.cookie || '';
    const token = cookieHeader.split(';').map((s) => s.trim()).find((s) => s.startsWith('refresh_token='))?.split('=')[1] || null;
    return this.authService.refresh({ refresh_token: token });
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookieHeader = req.headers?.cookie || '';
    const token = cookieHeader.split(';').map((s) => s.trim()).find((s) => s.startsWith('refresh_token='))?.split('=')[1] || null;
    // clear cookie by setting expired Set-Cookie
    res.setHeader('Set-Cookie', 'refresh_token=; Path=/; HttpOnly; Max-Age=0');
    return this.authService.logout({ refresh_token: token });
  }
}