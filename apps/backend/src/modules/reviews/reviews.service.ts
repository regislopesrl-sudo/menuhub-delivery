import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { HandleReviewDto } from './dto/handle-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: {
    status?: string;
    channel?: string;
    rating?: string;
    search?: string;
  }) {
    return this.prisma.review.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        status: query.status,
        channel: query.channel,
        rating: query.rating ? Number(query.rating) : undefined,
        OR: query.search
          ? [
              { title: { contains: query.search, mode: 'insensitive' } },
              { comment: { contains: query.search, mode: 'insensitive' } },
              { authorName: { contains: query.search, mode: 'insensitive' } },
              { authorContact: { contains: query.search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      include: {
        customer: true,
        order: true,
        handledBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ reviewAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async create(dto: CreateReviewDto) {
    if (dto.customerId) {
      await this.ensureCustomer(dto.customerId);
    }

    if (dto.orderId) {
      await this.ensureOrder(dto.orderId);
    }

    return this.prisma.review.create({
      data: {
        companyId: DEFAULT_COMPANY_ID,
        customerId: dto.customerId,
        orderId: dto.orderId,
        channel: dto.channel ?? 'manual',
        rating: dto.rating,
        title: dto.title,
        comment: dto.comment,
        authorName: dto.authorName,
        authorContact: dto.authorContact,
        sentiment: dto.sentiment,
        externalReference: dto.externalReference,
        metadata: dto.metadata as Prisma.InputJsonValue | undefined,
        reviewAt: dto.reviewAt ? new Date(dto.reviewAt) : undefined,
      },
      include: {
        customer: true,
        order: true,
      },
    });
  }

  async handle(id: string, dto: HandleReviewDto) {
    await this.findOne(id);

    if (dto.handledById) {
      await this.ensureUser(dto.handledById);
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        status: dto.status,
        internalNotes: dto.internalNotes,
        handledById: dto.handledById,
        handledAt: new Date(),
      },
      include: {
        customer: true,
        order: true,
        handledBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async reply(id: string, dto: ReplyReviewDto) {
    await this.findOne(id);

    return this.prisma.review.update({
      where: { id },
      data: {
        responseText: dto.responseText,
        responseAt: new Date(),
        status: 'replied',
      },
      include: {
        customer: true,
        order: true,
        handledBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  private async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review || review.companyId !== DEFAULT_COMPANY_ID) {
      throw new NotFoundException('Review não encontrada');
    }

    return review;
  }

  private async ensureCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer || customer.companyId !== DEFAULT_COMPANY_ID || customer.deletedAt) {
      throw new NotFoundException('Cliente não encontrado');
    }
  }

  private async ensureOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order || order.companyId !== DEFAULT_COMPANY_ID || order.deletedAt) {
      throw new NotFoundException('Pedido não encontrado');
    }
  }

  private async ensureUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt || !user.isActive) {
      throw new NotFoundException('Usuário responsável não encontrado');
    }
  }
}
