import { BadRequestException, Injectable } from '@nestjs/common';
import { DEFAULT_COMPANY_ID } from '@/common/default-context';
import { PrismaService } from '@/database/prisma.service';
import { DeliveryFeesService } from '../delivery-fees/delivery-fees.service';
import { MenuService } from '../menu/menu.service';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QuoteOrderDto } from './dto/quote-order.dto';

type CreatedOrder = {
  id: string;
  status: 'CONFIRMED';
  total: number;
};

@Injectable()
export class OrdersCoreService {
  private readonly processedKeys = new Map<string, CreatedOrder>();

  constructor(
    private readonly menuService: MenuService,
    private readonly deliveryFeesService: DeliveryFeesService,
    private readonly ordersService: OrdersService,
    private readonly prisma: PrismaService,
  ) {}

  async quote(dto: QuoteOrderDto) {
    const pricedItems = await Promise.all(
      dto.items.map(async (item) => {
        const menuItem = await this.menuService.findBySku(dto.restaurantId, item.sku);
        if (!menuItem) {
          throw new BadRequestException(`Item inválido: ${item.sku}`);
        }

        return {
          sku: menuItem.sku,
          name: menuItem.name,
          qty: item.qty,
          unitPrice: menuItem.price,
          lineTotal: menuItem.price * item.qty,
        };
      }),
    );

    const subtotal = pricedItems.reduce((acc, item) => acc + item.lineTotal, 0);
    const deliveryFee =
      dto.fulfillment.type === 'DELIVERY'
        ? this.deliveryFeesService.getFee(dto.fulfillment.neighborhood)
        : 0;

    return {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      itemsPriced: pricedItems,
    };
  }

  private async findOrCreateCustomer(phone: string, name?: string) {
    let customer = await this.prisma.customer.findFirst({
      where: {
        companyId: DEFAULT_COMPANY_ID,
        deletedAt: null,
        OR: [{ phone }, { whatsapp: phone }],
      },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          companyId: DEFAULT_COMPANY_ID,
          name: name?.trim() || 'Cliente WhatsApp',
          phone,
          whatsapp: phone,
        },
      });
    }

    return customer;
  }

  private async findOrCreateAddress(
    customerId: string,
    address: NonNullable<CreateOrderDto['address']>,
  ) {
    const existing = await this.prisma.customerAddress.findFirst({
      where: {
        customerId,
        street: address.street,
        number: address.number,
        district: address.neighborhood,
      },
    });

    if (existing) return existing;

    return this.prisma.customerAddress.create({
      data: {
        customerId,
        label: 'WhatsApp',
        street: address.street,
        number: address.number,
        district: address.neighborhood,
        city: 'Nao informado',
        state: 'NA',
        reference: address.reference,
      },
    });
  }

  async create(dto: CreateOrderDto): Promise<CreatedOrder> {
    if (this.processedKeys.has(dto.idempotencyKey)) {
      return this.processedKeys.get(dto.idempotencyKey)!;
    }

    if (dto.fulfillment.type === 'DELIVERY' && !dto.address) {
      throw new BadRequestException('Endereço é obrigatório para entrega');
    }

    const quote = await this.quote({
      restaurantId: dto.restaurantId,
      fulfillment: {
        type: dto.fulfillment.type,
        neighborhood: dto.address?.neighborhood,
      },
      items: dto.items.map((i) => ({
        sku: i.sku,
        qty: i.qty,
      })),
    });

    const customer = await this.findOrCreateCustomer(dto.customer.phone, dto.customer.name);

    const items = await Promise.all(
      dto.items.map(async (item) => {
        const menuItem = await this.menuService.findBySku(dto.restaurantId, item.sku);
        if (!menuItem) {
          throw new BadRequestException(`Item não integrado ao núcleo de pedidos: ${item.sku}`);
        }

        if (menuItem.type !== 'PRODUCT') {
          throw new BadRequestException(`Item não integrado ao núcleo de pedidos: ${item.sku}`);
        }

        return {
          productId: menuItem.productId,
          quantity: item.qty,
          unitPrice: menuItem.price,
          notes: item.notes,
        };
      }),
    );

    const delivery =
      dto.fulfillment.type === 'DELIVERY' && dto.address
        ? {
            customerAddressId: (await this.findOrCreateAddress(customer.id, dto.address)).id,
            deliveryFee: quote.deliveryFee,
          }
        : undefined;

    const order = await this.ordersService.create({
      customerId: customer.id,
      orderType: dto.fulfillment.type === 'DELIVERY' ? 'delivery' : 'pickup',
      channel: dto.channel,
      notes:
        dto.fulfillment.type === 'DELIVERY' && dto.address
          ? `Endereco: ${dto.address.street}, ${dto.address.number} - ${dto.address.neighborhood}${dto.address.reference ? ` (${dto.address.reference})` : ''}`
          : undefined,
      items,
      delivery,
      payments: [{ paymentMethod: dto.payment.method, amount: quote.total }],
    });

    await this.ordersService.updateStatus(order.id, {
      status: 'CONFIRMED',
      notes: 'Pedido confirmado via canal público',
    });

    const created: CreatedOrder = {
      id: order.id,
      status: 'CONFIRMED',
      total: quote.total,
    };

    this.processedKeys.set(dto.idempotencyKey, created);
    return created;
  }
}
