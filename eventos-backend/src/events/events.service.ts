import {
  Injectable, NotFoundException, BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repo: Repository<Event>,
  ) {}

  findAll() {
    return this.repo.find({
      order: { start_date: 'ASC' },
    });
  }

  async decrementSpots(eventId: number) {
    await this.repo.decrement({ id: eventId }, 'available_spots', 1);
  }

  async incrementSpots(eventId: number) {
    const event = await this.findOne(eventId);
    if (event.available_spots < event.capacity) {
      await this.repo.increment({ id: eventId }, 'available_spots', 1);
    }
  }

  async findOne(id: number) {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async create(dto: CreateEventDto, organizerId: number) {
    if (new Date(dto.end_date) <= new Date(dto.start_date)) {
      throw new BadRequestException('La fecha de fin debe ser posterior a la de inicio');
    }

    const event = new Event();
    event.title = dto.title;
    event.description = dto.description || '';
    event.start_date = new Date(dto.start_date);
    event.end_date = new Date(dto.end_date);
    event.location = dto.location || '';
    event.capacity = dto.capacity;
    event.available_spots = dto.capacity;
    event.organizer = { id: organizerId } as any;
    event.event_type = dto.event_type || '';
    event.program = dto.program || '';

    const saved = await this.repo.save(event);
    return this.findOne(saved.id);
    
  }

  async update(id: number, dto: UpdateEventDto) {
    await this.findOne(id);
    await this.repo.update(id, { ...dto });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Evento eliminado' };
  }

  async cancelEvent(id: number) {
  await this.findOne(id);
  await this.repo.update(id, { status: 'cancelled' });
  return this.findOne(id);
  }

}