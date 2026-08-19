import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Request() req, @Body() createReservationDto: any) {
    return this.reservationsService.create(req.user.userId, createReservationDto);
  }

  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get('me')
  findMyReservations(@Request() req) {
    return this.reservationsService.findByUserId(req.user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateReservationDto: any) {
    return this.reservationsService.update(id, req.user.userId, updateReservationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.reservationsService.remove(id, req.user.userId);
  }
}
