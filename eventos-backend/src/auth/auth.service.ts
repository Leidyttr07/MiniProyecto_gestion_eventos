import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // create refresh token and save hashed in DB
    const refresh_token = this.jwtService.sign(payload);
    const hashed = await bcrypt.hash(refresh_token, 10);
    await this.usersService.setRefreshToken(user.id, hashed);

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      if (!dto.refresh_token) throw new UnauthorizedException('Token faltante');
      const payload = this.jwtService.verify(dto.refresh_token as string);
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Token inválido');
      const valid = user.refresh_token ? await bcrypt.compare(dto.refresh_token as string, user.refresh_token) : false;
      if (!valid) throw new UnauthorizedException('Token inválido o expirado');

      const newPayload = { sub: user.id, email: user.email, role: user.role };
      const access_token = this.jwtService.sign(newPayload);

      return { access_token };
    } catch (err) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async logout(dto: RefreshTokenDto) {
    try {
      if (!dto.refresh_token) throw new BadRequestException('Refresh token faltante');
      const payload = this.jwtService.verify(dto.refresh_token as string);
      await this.usersService.removeRefreshToken(payload.sub);
      return { message: 'Logged out' };
    } catch (err) {
      throw new BadRequestException('Refresh token inválido');
    }
  }
}