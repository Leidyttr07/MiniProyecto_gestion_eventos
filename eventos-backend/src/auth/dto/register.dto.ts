import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  last_name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  student_code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  program?: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]+$/,
    { message: 'La contraseña debe contener mayúscula, minúscula, número y carácter especial' }
  )
  password: string;
}