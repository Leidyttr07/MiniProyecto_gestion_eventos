import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: 'EventRepository', useValue: mockRepo },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne should throw NotFoundException when event not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create should validate dates and throw BadRequestException for invalid dates', async () => {
    const dto = {
      title: 'Test',
      start_date: new Date('2026-06-02T10:00:00Z').toISOString(),
      end_date: new Date('2026-06-01T10:00:00Z').toISOString(),
      capacity: 10,
    };
    await expect(service.create(dto as any, 1)).rejects.toBeInstanceOf(BadRequestException);
  });
});
