import {
  IsString, IsDateString, IsInt,
  IsOptional, IsPositive, MaxLength
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title: string = '';

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  start_date: string = '';

  @IsDateString()
  end_date: string = '';

  @IsString()
  location?: string;

  @IsInt()
  @IsPositive()
  capacity: number = 30;

  @IsString()
  @IsOptional()
  event_type?: string;

  @IsString()
  @IsOptional()
  program?: string;
}