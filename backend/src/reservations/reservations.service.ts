import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  private async validateReservation(startTime: Date, endTime: Date, roomId: string, excludeId?: string) {
    const now = new Date();
    
    // 1. Não pode ocorrer no passado
    if (startTime < now) {
      throw new BadRequestException('A reserva não pode ocorrer no passado');
    }

    // 2. Duração mínima de 1 hora
    const durationMs = endTime.getTime() - startTime.getTime();
    const oneHourMs = 60 * 60 * 1000;
    if (durationMs < oneHourMs) {
      throw new BadRequestException('A reserva deve ter duração mínima de 1 hora');
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
      throw new ConflictException('Conflito de horário: a sala já está reservada neste período');
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
      throw new NotFoundException('Reserva não encontrada');
    }
    
    if (reservation.userId !== userId) {
      throw new ForbiddenException('Você só pode atualizar suas próprias reservas');
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
      throw new NotFoundException('Reserva não encontrada');
    }
    
    if (reservation.userId !== userId) {
      throw new ForbiddenException('Você só pode excluir suas próprias reservas');
    }

    return this.prisma.reservation.delete({
      where: { id },
    });
  }
}
