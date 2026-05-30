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
      relations: { organizer: true, category: true },
      order: { start_date: 'ASC' },
    });
  }

  async findOne(id: number) {
    const event = await this.repo.findOne({
      where: { id },
      relations: { organizer: true, category: true },
    });
    if (!event) throw new NotFoundException('Evento no encontrado');
    return event;
  }

  async create(dto: CreateEventDto, organizerId: number) {
    if (new Date(dto.end_date) <= new Date(dto.start_date)) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la de inicio'
      );
    }

    const event = this.repo.create({
      ...dto,
      available_spots: dto.capacity,
      organizer: { id: organizerId },
      category: dto.category_id ? { id: dto.category_id } : undefined,
    });

    const saved = await this.repo.save(event);
    return this.findOne(saved.id);
  }

  async update(id: number, dto: UpdateEventDto) {
    await this.findOne(id);
    await this.repo.update(id, {
      ...dto,
      category: dto.category_id ? { id: dto.category_id } : undefined,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Evento eliminado' };
  }
}