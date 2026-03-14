export type BotState =
  | 'START'
  | 'COLLECT_ITEMS'
  | 'ASK_DELIVERY_OR_PICKUP'
  | 'ASK_ADDRESS'
  | 'CONFIRM_ORDER'
  | 'ASK_PAYMENT'
  | 'PLACE_ORDER'
  | 'DONE'
  | 'HUMAN_HANDOFF';

export type CartItem = {
  sku: string;
  name: string;
  qty: number;
  price: number;
  notes?: string;
};

export type SessionAddress = {
  street?: string;
  number?: string;
  neighborhood?: string;
  reference?: string;
};

export type SessionPayment = {
  method?: 'PIX' | 'CARD' | 'CASH';
};

export type SessionFulfillment = {
  type?: 'DELIVERY' | 'PICKUP';
};

export type SessionTotals = {
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type BotSession = {
  phone: string;
  customerName?: string;
  state: BotState;
  cart: CartItem[];
  fulfillment?: SessionFulfillment;
  address?: SessionAddress;
  payment?: SessionPayment;
  totals?: SessionTotals;
  handoff?: boolean;
  lastMessageId?: string;
  updatedAt: number;
};
