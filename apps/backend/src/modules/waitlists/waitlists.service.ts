import { Injectable, NotFoundException } from '@nestjs/common';
import { DEFAULT_BRANCH_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { UpdateWaitlistDto } from './dto/update-waitlist.dto';

@Injectable()
export class WaitlistsService {
  constructor(private readonly prisma: PrismaService) {}

  private get waitlistDelegate() {
    return (this.prisma as any).waitlist;
  }

  findAll() {
    return this.waitlistDelegate.findMany({
      where: { branchId: DEFAULT_BRANCH_ID },
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(dto: CreateWaitlistDto) {
    return this.waitlistDelegate.create({
      data: {
        branchId: DEFAULT_BRANCH_ID,
        customerId: dto.customerId,
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        guestCount: dto.guestCount,
        notes: dto.notes,
      },
      include: {
        customer: true,
      },
    });
  }

  async update(id: string, dto: UpdateWaitlistDto) {
    const item = await this.waitlistDelegate.findUnique({
      where: { id },
    });

    if (!item || item.branchId !== DEFAULT_BRANCH_ID) {
      throw new NotFoundException('Entrada da fila não encontrada');
    }

    return this.waitlistDelegate.update({
      where: { id },
      data: {
        customerId: dto.customerId,
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        guestCount: dto.guestCount,
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        customer: true,
      },
    });
  }
}
