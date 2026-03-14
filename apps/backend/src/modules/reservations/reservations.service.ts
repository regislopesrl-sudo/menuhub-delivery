import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_BRANCH_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  private get reservationDelegate() {
    return (this.prisma as any).reservation;
  }

  findAll() {
    return this.reservationDelegate.findMany({
      where: { branchId: DEFAULT_BRANCH_ID },
      include: {
        customer: true,
        table: true,
      },
      orderBy: { reservationAt: 'asc' },
    });
  }

  create(dto: CreateReservationDto) {
    return this.reservationDelegate.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        customerId: dto.customerId,
        tableId: dto.tableId,
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        guestCount: dto.guestCount,
        reservationAt: new Date(dto.reservationAt),
        notes: dto.notes,
      },
      include: {
        customer: true,
        table: true,
      },
    });
  }

  async update(id: string, dto: UpdateReservationDto) {
    const reservation = await this.reservationDelegate.findUnique({
      where: { id },
    });

    if (!reservation || reservation.branchId !== DEFAULT_BRANCH_ID) {
      throw new NotFoundException('Reserva não encontrada');
    }

    return this.reservationDelegate.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        tableId: dto.tableId,
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        guestCount: dto.guestCount,
        reservationAt: dto.reservationAt ? new Date(dto.reservationAt) : undefined,
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        customer: true,
        table: true,
      },
    });
  }
}
