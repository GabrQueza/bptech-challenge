import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private async validateReservation(startTime: Date, endTime: Date, roomId: string, excludeId?: string) {
    const now = new Date();
    
    // 1. Não pode ocorrer no passado
    if (startTime < now) {
      throw new BadRequestException('Reservation cannot be in the past');
    }

    // 2. Duração mínima de 1 hora
    const durationMs = endTime.getTime() - startTime.getTime();
    const oneHourMs = 60 * 60 * 1000;
    if (durationMs < oneHourMs) {
      throw new BadRequestException('Reservation must be at least 1 hour long');
    }

    // 3. Checar sobreposição de horários
    const overlapping = await this.prisma.reservation.findFirst({
      where: {
        roomId,
        id: excludeId ? { not: excludeId } : undefined,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (overlapping) {
      throw new ConflictException('Reservation overlaps with an existing one');
    }
  }

  async create(userId: string, data: any) {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const date = new Date(data.date);

    await this.validateReservation(startTime, endTime, data.roomId);

    return this.prisma.reservation.create({
      data: {
        ...data,
        date,
        startTime,
        endTime,
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

    const startTime = data.startTime ? new Date(data.startTime) : reservation.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : reservation.endTime;
    const roomId = data.roomId || reservation.roomId;

    if (data.startTime || data.endTime || data.roomId) {
      await this.validateReservation(startTime, endTime, roomId, id);
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
