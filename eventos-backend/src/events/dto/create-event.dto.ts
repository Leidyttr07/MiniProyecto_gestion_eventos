import {
  IsString, IsDateString, IsInt,
  IsOptional, IsPositive, MaxLength, Min
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsInt()
  @IsPositive()
  capacity: number;

  @IsInt()
  @IsOptional()
  category_id?: number;
}