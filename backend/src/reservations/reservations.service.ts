import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.reservation.create({
      data: {
        ...data,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async update(id: string, userId: string, data: any) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    
    if (reservation.userId !== userId) {
      throw new ForbiddenException('You can only update your own reservations');
    }
    
    return this.prisma.reservation.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    
    if (reservation.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reservations');
    }

    return this.prisma.reservation.delete({
      where: { id },
    });
  }
}
