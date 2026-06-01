import {
  Injectable, NotFoundException, BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { FindEventsDto } from './dto/find-events.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repo: Repository<Event>,
  ) {}

  async findAll(query?: FindEventsDto) {
    const qb = this.repo.createQueryBuilder('e')
      .leftJoinAndSelect('e.organizer', 'organizer')
      .leftJoinAndSelect('e.category', 'category')
      .orderBy('e.start_date', 'ASC');

    if (query?.q) {
      qb.andWhere('(e.title ILIKE :q OR e.description ILIKE :q)', { q: `%${query.q}%` });
    }

    if (query?.category_id) {
      qb.andWhere('category.id = :cid', { cid: query.category_id });
    }

    if (query?.status) {
      qb.andWhere('e.status = :status', { status: query.status });
    }

    if (query?.start_date && query?.end_date) {
      qb.andWhere('e.start_date <= :end AND e.end_date >= :start', {
        start: query.start_date,
        end: query.end_date,
      });
    } else if (query?.start_date) {
      qb.andWhere('e.end_date >= :start', { start: query.start_date });
    } else if (query?.end_date) {
      qb.andWhere('e.start_date <= :end', { end: query.end_date });
    }

    // Pagination
    const page = query?.page ? Number(query.page) : null;
    const limit = query?.limit ? Number(query.limit) : null;
    if (page && limit) {
      const skip = (page - 1) * limit;
      const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
      return { data, total, page, limit };
    }

    return qb.getMany();
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