import {
  Injectable, NotFoundException,
  BadRequestException, ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration } from './registration.entity';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { EventsService } from '../events/events.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private repo: Repository<Registration>,
    private eventsService: EventsService,
  ) {}

  // Inscribirse a un evento
  async create(dto: CreateRegistrationDto, userId: number) {
    const event = await this.eventsService.findOne(dto.event_id);

    // Verificar que el evento esté activo
    if (event.status !== 'active') {
      throw new BadRequestException('El evento no está disponible');
    }

    // Verificar cupos
    if (event.available_spots <= 0) {
      throw new BadRequestException('No hay cupos disponibles');
    }

    // Verificar que no esté ya inscrito
    const existing = await this.repo.findOne({
      where: {
        user: { id: userId },
        event: { id: dto.event_id },
        status: 'active',
      },
    });
    if (existing) {
      throw new ConflictException('Ya estás inscrito en este evento');
    }

    const registration = this.repo.create({
      user: { id: userId },
      event: { id: dto.event_id },
      status: 'active',
    });

    return this.repo.save(registration);
  }

  // Cancelar inscripción
  async cancel(registrationId: number, userId: number) {
    const registration = await this.repo.findOne({
      where: { id: registrationId },
      relations: { user: true, event: true },
    });

    if (!registration) {
      throw new NotFoundException('Inscripción no encontrada');
    }

    // Solo el dueño puede cancelar
    if (registration.user.id !== userId) {
      throw new BadRequestException('No tienes permiso para cancelar esta inscripción');
    }

    if (registration.status === 'cancelled') {
      throw new BadRequestException('La inscripción ya fue cancelada');
    }

    registration.status = 'cancelled';
    return this.repo.save(registration);
  }

  // Ver mis inscripciones
  findMyRegistrations(userId: number) {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: { event: true },
      order: { registered_at: 'DESC' },
    });
  }

  // Ver inscripciones de un evento (solo admin)
  findByEvent(eventId: number) {
    return this.repo.find({
      where: { event: { id: eventId }, status: 'active' },
      relations: { user: true },
    });
  }
}