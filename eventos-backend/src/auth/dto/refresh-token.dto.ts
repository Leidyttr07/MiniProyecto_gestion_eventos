import { IsString, IsOptional } from 'class-validator';

export class RefreshTokenDto {
  @IsOptional()
  @IsString()
  refresh_token?: string | null;
}
