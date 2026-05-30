import { IsInt, IsPositive } from 'class-validator';

export class CreateRegistrationDto {
  @IsInt()
  @IsPositive()
  event_id: number;
}