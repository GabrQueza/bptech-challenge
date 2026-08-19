import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    reservation: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create validations', () => {
    const userId = 'user-1';

    it('1. tentativa no passado (deve lançar BadRequestException)', async () => {
      const pastStartTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Yesterday
      const pastEndTime = new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(); // 1 hour later

      const dto = {
        roomId: 'sala-a',
        date: new Date().toISOString(),
        startTime: pastStartTime,
        endTime: pastEndTime,
      };

      await expect(service.create(userId, dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.reservation.findFirst).not.toHaveBeenCalled();
    });

    it('2. duração menor que 1 hora (deve lançar BadRequestException)', async () => {
      // Future date to avoid past validation
      const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(); // +30 minutes

      const dto = {
        roomId: 'sala-a',
        date: new Date().toISOString(),
        startTime,
        endTime,
      };

      await expect(service.create(userId, dto)).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.reservation.findFirst).not.toHaveBeenCalled();
    });

    it('3. sobreposição de horários (deve lançar ConflictException)', async () => {
      const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(); // +2 hours

      const dto = {
        roomId: 'sala-a',
        date: new Date().toISOString(),
        startTime,
        endTime,
      };

      // Mock overlapping reservation found
      mockPrismaService.reservation.findFirst.mockResolvedValue({
        id: 'existing-id',
        roomId: 'sala-a',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });

      await expect(service.create(userId, dto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.reservation.create).not.toHaveBeenCalled();
    });

    it('4. criação com sucesso', async () => {
      const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(); // +2 hours

      const dto = {
        roomId: 'sala-a',
        date: new Date().toISOString(),
        startTime,
        endTime,
      };

      // Mock NO overlapping reservation found
      mockPrismaService.reservation.findFirst.mockResolvedValue(null);

      mockPrismaService.reservation.create.mockResolvedValue({
        id: 'new-res-id',
        userId,
        ...dto,
        date: new Date(dto.date),
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
      });

      const result = await service.create(userId, dto);

      expect(mockPrismaService.reservation.findFirst).toHaveBeenCalled();
      expect(mockPrismaService.reservation.create).toHaveBeenCalled();
      expect(result.id).toEqual('new-res-id');
    });
  });
});
