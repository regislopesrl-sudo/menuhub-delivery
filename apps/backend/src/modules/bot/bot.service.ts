import { Injectable } from '@nestjs/common';
import { MenuService } from '../menu/menu.service';
import { OrdersCoreService } from '../orders-core/orders-core.service';
import { SessionService } from './session.service';
import { BotSession } from './types';

@Injectable()
export class BotService {
  private readonly restaurantId = 'rest_1';

  constructor(
    private readonly sessionService: SessionService,
    private readonly menuService: MenuService,
    private readonly ordersCoreService: OrdersCoreService,
  ) {}

  async handleIncomingMessage(phone: string, text: string, messageId?: string): Promise<string> {
    const session = await this.sessionService.getOrCreate(phone);
    session.lastMessageId = messageId;

    const normalized = text.trim().toLowerCase();

    if (this.isHumanHandoff(normalized)) {
      await this.sessionService.markHandoff(phone);
      return 'Entendi. Vou transferir seu atendimento para um atendente.';
    }

    if (normalized === 'cancelar') {
      await this.sessionService.reset(phone);
      return 'Pedido cancelado. Me diga novamente o que você quer pedir.';
    }

    if (normalized === 'ver carrinho') {
      return this.renderCart(session);
    }

    if (normalized.startsWith('remover ')) {
      const raw = normalized.replace('remover ', '').trim();
      session.cart = session.cart.filter((item) => !item.name.toLowerCase().includes(raw));
      await this.sessionService.save(session);
      return `Item removido.\n\n${this.renderCart(session)}`;
    }

    const extractedItems = await this.parseItemsFromText(text);
    if (extractedItems.length > 0) {
      this.applyItemsToCart(session, extractedItems);
      session.state = 'ASK_DELIVERY_OR_PICKUP';
      await this.sessionService.save(session);
      return `Anotei seu pedido.\n\n${this.renderCart(session)}\n\nVai ser entrega ou retirada?`;
    }

    switch (session.state) {
      case 'START':
      case 'COLLECT_ITEMS':
        session.state = 'COLLECT_ITEMS';
        await this.sessionService.save(session);
        return 'Me diga seu pedido. Exemplo: 2 carne, 1 queijo e 1 coca 2L.';

      case 'ASK_DELIVERY_OR_PICKUP':
        if (normalized.includes('retirada')) {
          session.fulfillment = { type: 'PICKUP' };
          const quote = await this.ordersCoreService.quote({
            restaurantId: this.restaurantId,
            fulfillment: { type: 'PICKUP' },
            items: session.cart.map((i) => ({ sku: i.sku, qty: i.qty })),
          });

          session.totals = {
            subtotal: quote.subtotal,
            deliveryFee: quote.deliveryFee,
            total: quote.total,
          };

          session.state = 'CONFIRM_ORDER';
          await this.sessionService.save(session);
          return this.renderConfirmation(session);
        }

        if (normalized.includes('entrega') || normalized.includes('delivery')) {
          session.fulfillment = { type: 'DELIVERY' };
          session.state = 'ASK_ADDRESS';
          await this.sessionService.save(session);
          return 'Me envie rua, número e bairro para entrega.';
        }

        return 'Vai ser entrega ou retirada?';

      case 'ASK_ADDRESS': {
        const address = this.parseAddress(text);

        if (!address.street || !address.number || !address.neighborhood) {
          return 'Envie o endereço no formato: Rua, número, bairro.';
        }

        session.address = address;

        const quote = await this.ordersCoreService.quote({
          restaurantId: this.restaurantId,
          fulfillment: {
            type: 'DELIVERY',
            neighborhood: address.neighborhood,
          },
          items: session.cart.map((i) => ({ sku: i.sku, qty: i.qty })),
        });

        session.totals = {
          subtotal: quote.subtotal,
          deliveryFee: quote.deliveryFee,
          total: quote.total,
        };

        session.state = 'CONFIRM_ORDER';
        await this.sessionService.save(session);
        return this.renderConfirmation(session);
      }

      case 'CONFIRM_ORDER':
        if (normalized === 'confirmar' || normalized === 'sim') {
          session.state = 'ASK_PAYMENT';
          await this.sessionService.save(session);
          return 'Como deseja pagar? Pix, cartão ou dinheiro?';
        }

        if (normalized.includes('alterar')) {
          session.state = 'COLLECT_ITEMS';
          await this.sessionService.save(session);
          return 'Me diga o que deseja alterar no pedido.';
        }

        return 'Se estiver tudo certo, responda confirmar. Para mudar algo, escreva alterar.';

      case 'ASK_PAYMENT':
        if (normalized.includes('pix')) {
          session.payment = { method: 'PIX' };
        } else if (normalized.includes('cart')) {
          session.payment = { method: 'CARD' };
        } else if (normalized.includes('dinheiro')) {
          session.payment = { method: 'CASH' };
        } else {
          return 'Forma de pagamento: Pix, cartão ou dinheiro?';
        }

        session.state = 'PLACE_ORDER';
        await this.sessionService.save(session);

        const order = await this.ordersCoreService.create({
          restaurantId: this.restaurantId,
          channel: 'WHATSAPP',
          customer: {
            phone: session.phone,
            name: session.customerName,
          },
          fulfillment: {
            type: session.fulfillment?.type ?? 'PICKUP',
          },
          address:
            session.fulfillment?.type === 'DELIVERY' &&
            session.address?.street &&
            session.address?.number &&
            session.address?.neighborhood
              ? {
                  street: session.address.street,
                  number: session.address.number,
                  neighborhood: session.address.neighborhood,
                  reference: session.address.reference,
                }
              : undefined,
          items: session.cart.map((item) => ({
            sku: item.sku,
            qty: item.qty,
            notes: item.notes,
          })),
          payment: {
            method: session.payment.method!,
          },
          idempotencyKey: `wa:${session.phone}:${session.lastMessageId ?? Date.now()}`,
        });

        session.state = 'DONE';
        await this.sessionService.save(session);

        return `Pedido confirmado.\nNúmero: ${order.id}\nTotal: R$ ${order.total.toFixed(2)}\nStatus: ${order.status}`;

      case 'DONE':
        return 'Seu pedido já foi criado. Se quiser fazer outro, escreva: novo pedido.';

      case 'HUMAN_HANDOFF':
        return 'Seu atendimento foi encaminhado para um atendente.';

      default:
        await this.sessionService.reset(phone);
        return 'Vamos começar de novo. Me diga seu pedido.';
    }
  }

  private async parseItemsFromText(text: string) {
    const normalized = text.toLowerCase();
    const parts = normalized.split(',');
    const found: Array<{ sku: string; name: string; qty: number; price: number }> = [];

    for (const part of parts) {
      const qtyMatch = part.match(/\d+/);
      const qty = qtyMatch ? Number(qtyMatch[0]) : 1;
      const item = await this.menuService.findByText(this.restaurantId, part);
      if (item) {
        found.push({
          sku: item.sku,
          name: item.name,
          qty,
          price: item.price,
        });
      }
    }

    return found;
  }

  private applyItemsToCart(
    session: BotSession,
    items: Array<{ sku: string; name: string; qty: number; price: number }>,
  ) {
    for (const item of items) {
      const existing = session.cart.find((c) => c.sku === item.sku);
      if (existing) {
        existing.qty += item.qty;
      } else {
        session.cart.push({
          sku: item.sku,
          name: item.name,
          qty: item.qty,
          price: item.price,
        });
      }
    }
  }

  private parseAddress(text: string) {
    const parts = text.split(',').map((p) => p.trim());
    return {
      street: parts[0],
      number: parts[1],
      neighborhood: parts[2],
      reference: parts[3],
    };
  }

  private renderCart(session: BotSession) {
    if (session.cart.length === 0) return 'Carrinho vazio.';

    const lines = session.cart.map(
      (item) => `- ${item.qty}x ${item.name} | R$ ${item.price.toFixed(2)}`,
    );

    return `Carrinho:\n${lines.join('\n')}`;
  }

  private renderConfirmation(session: BotSession) {
    const addressText =
      session.fulfillment?.type === 'DELIVERY'
        ? `Entrega: ${session.address?.street}, ${session.address?.number} - ${session.address?.neighborhood}`
        : 'Retirada no balcão';

    return [
      'Confere seu pedido:',
      '',
      this.renderCart(session),
      '',
      addressText,
      `Subtotal: R$ ${session.totals?.subtotal.toFixed(2)}`,
      `Taxa: R$ ${session.totals?.deliveryFee.toFixed(2)}`,
      `Total: R$ ${session.totals?.total.toFixed(2)}`,
      '',
      'Responda confirmar para fechar o pedido.',
    ].join('\n');
  }

  private isHumanHandoff(text: string) {
    const triggers = [
      'reclamação',
      'processo',
      'procon',
      'reembolso',
      'atendente',
      'humano',
      'atendimento péssimo',
      'vou denunciar',
    ];

    return triggers.some((term) => text.includes(term));
  }
}
