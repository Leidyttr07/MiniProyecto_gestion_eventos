import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsService } from './registrations.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('RegistrationsService (unit)', () => {
  let service: RegistrationsService;

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockEventsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    // instantiate directly to avoid Nest DI complexity for repository tokens
    const RegistrationsServiceClass = require('./registrations.service').RegistrationsService;
    service = new RegistrationsServiceClass(mockRepo as any, mockEventsService as any);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should throw when event not active', async () => {
    mockEventsService.findOne.mockResolvedValue({ status: 'cancelled', available_spots: 10 });
    await expect(service.create({ event_id: 1 } as any, 1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create should throw when no spots', async () => {
    mockEventsService.findOne.mockResolvedValue({ status: 'active', available_spots: 0 });
    await expect(service.create({ event_id: 1 } as any, 1)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('create should throw when already registered', async () => {
    mockEventsService.findOne.mockResolvedValue({ status: 'active', available_spots: 5 });
    mockRepo.findOne.mockResolvedValue({ id: 1 });
    await expect(service.create({ event_id: 1 } as any, 1)).rejects.toBeInstanceOf(ConflictException);
  });
});
