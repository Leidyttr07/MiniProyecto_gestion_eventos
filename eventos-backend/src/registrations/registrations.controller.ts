import {
  Controller, Post, Put, Get,
  Param, Body, UseGuards
} from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('registrations')
@UseGuards(JwtAuthGuard)
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // Inscribirse a un evento
  @Post()
  @UseGuards(RolesGuard)
  @Roles('participant')
  create(@Body() dto: CreateRegistrationDto, @CurrentUser() user: any) {
    return this.registrationsService.create(dto, user.id);
  }

  // Cancelar inscripción
  @Put(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('participant')
  cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.registrationsService.cancel(+id, user.id);
  }

  // Ver mis inscripciones
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('participant')
  myRegistrations(@CurrentUser() user: any) {
    return this.registrationsService.findMyRegistrations(user.id);
  }

  // Ver inscritos de un evento (solo admin)
  @Get('event/:eventId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findByEvent(@Param('eventId') eventId: string) {
    return this.registrationsService.findByEvent(+eventId);
  }
}