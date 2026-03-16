'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';
import { StatusBadge } from '@/components/ui/status-badge';
import { useToast } from '@/components/ui/toast-provider';

type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

type CheckoutAddress = {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  reference: string;
  deliveryAreaId?: string;
  ibgeCode?: string;
};

type OrderType =
  | 'delivery'
  | 'counter'
  | 'pickup'
  | 'table'
  | 'command'
  | 'whatsapp'
  | 'kiosk'
  | 'qr';

type OrderFormState = {
  customerId: string;
  customerAddressId: string;
  orderType: OrderType;
  channel: string;
  tableId: string;
  commandId: string;
  paymentMethod: string;
  notes: string;
  useNewAddress: boolean;
};

type CreateFormProps = {
  initialTableId?: string;
  initialCommandId?: string;
  initialOrderType?: OrderType;
  initialChannel?: string;
};

export function OrderCreateForm({
  initialTableId,
  initialCommandId,
  initialOrderType,
  initialChannel = 'admin',
}: CreateFormProps) {
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState<OrderFormState>({
    customerId: '',
    customerAddressId: '',
    orderType: initialOrderType ?? 'delivery',
    channel: initialChannel,
    tableId: initialTableId ?? '',
    commandId: initialCommandId ?? '',
    paymentMethod: 'pix',
    notes: '',
    useNewAddress: false,
  });
  const [newAddress, setNewAddress] = useState<CheckoutAddress>({
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    reference: '',
    deliveryAreaId: undefined,
    ibgeCode: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [zipCodeLoading, setZipCodeLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    supported?: boolean;
    deliveryAreaId?: string;
    deliveryAreaName?: string;
    deliveryFee?: number;
    estimatedMinutes?: number;
  } | null>(null);
  const [linkedTableId, setLinkedTableId] = useState(initialTableId ?? '');
  const [linkedCommandId, setLinkedCommandId] = useState(initialCommandId ?? '');

  useEffect(() => {
    api
      .get('/products')
      .then((response) => setProducts(response.data ?? response))
      .catch(() => setProducts([]));
    api
      .get('/customers')
      .then((response) => setCustomers(response.data ?? response))
      .catch(() => setCustomers([]));
  }, []);

  useEffect(() => {
    if (!form.customerId) {
      setAddresses([]);
      return;
    }

    api
      .get(`/customers/${form.customerId}`)
      .then((customer) => setAddresses(customer.addresses ?? []))
      .catch(() => setAddresses([]));
  }, [form.customerId]);

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0),
    [cart],
  );

  const total = useMemo(
    () => subtotal + Number(deliveryInfo?.supported ? deliveryInfo.deliveryFee ?? 0 : 0),
    [deliveryInfo, subtotal],
  );

  function addToCart(product: any) {
    setCart((prev) => {
      const exists = prev.find((item) => item.productId === product.id);

      if (exists) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: Number(product.salePrice ?? 0),
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
  }

  async function lookupZipCode() {
    const zipCode = newAddress.zipCode.replace(/\D/g, '');
    if (zipCode.length !== 8) {
      showToast('Informe um CEP válido', 'error');
      return;
    }

    setZipCodeLoading(true);

    try {
      const zipData = await api.get(`/addresses/zipcode/${zipCode}`);
      const area = await api.post('/delivery/check-zipcode', { zipCode });

      setNewAddress((prev) => ({
        ...prev,
        zipCode: zipData.cep ?? zipCode,
        street: zipData.street ?? '',
        district: zipData.district ?? '',
        city: zipData.city ?? '',
        state: zipData.state ?? '',
        ibgeCode: zipData.ibgeCode ?? undefined,
        deliveryAreaId: area.deliveryAreaId ?? undefined,
      }));
      setDeliveryInfo(area);
    } catch (error: any) {
      setDeliveryInfo(null);
      showToast(error.message || 'Erro ao buscar CEP', 'error');
    } finally {
      setZipCodeLoading(false);
    }
  }

  async function handleSubmit() {
    if (!cart.length) {
      showToast('Adicione itens ao carrinho', 'error');
      return;
    }

    if (form.orderType === 'delivery') {
      if (form.useNewAddress) {
        if (!deliveryInfo?.supported) {
          showToast('Valide um CEP atendido antes de continuar', 'error');
          return;
        }

        if (
          !form.customerId ||
          !newAddress.street ||
          !newAddress.number ||
          !newAddress.district ||
          !newAddress.city ||
          !newAddress.state
        ) {
          showToast('Preencha o novo endereço de entrega', 'error');
          return;
        }
      } else if (!form.customerAddressId) {
        showToast('Selecione um endereço de entrega', 'error');
        return;
      }
    }

    setLoading(true);

    try {
      let customerAddressId = form.customerAddressId || undefined;

      if (form.orderType === 'delivery' && form.useNewAddress && form.customerId) {
        const customer = await api.get(`/customers/${form.customerId}`);
        const payloadAddresses = [
          ...(customer.addresses ?? []).map((address: any) => ({
            zipCode: address.zipCode,
            street: address.street,
            number: address.number,
            complement: address.complement,
            district: address.district,
            city: address.city,
            state: address.state,
            reference: address.reference,
            deliveryAreaId: address.deliveryAreaId,
            ibgeCode: address.ibgeCode,
            latitude: address.latitude,
            longitude: address.longitude,
            isDefault: address.isDefault,
          })),
          {
            zipCode: newAddress.zipCode || undefined,
            street: newAddress.street,
            number: newAddress.number,
            complement: newAddress.complement || undefined,
            district: newAddress.district,
            city: newAddress.city,
            state: newAddress.state,
            reference: newAddress.reference || undefined,
            deliveryAreaId: newAddress.deliveryAreaId,
            ibgeCode: newAddress.ibgeCode,
            isDefault: !(customer.addresses ?? []).length,
          },
        ];

        const updatedCustomer = await api.patch(`/customers/${form.customerId}`, {
          addresses: payloadAddresses,
        });
        const createdAddress = updatedCustomer.addresses?.[updatedCustomer.addresses.length - 1];
        customerAddressId = createdAddress?.id;
      }

      await api.post('/orders', {
        customerId: form.customerId || undefined,
        orderType: form.orderType,
        channel: form.channel,
        tableId: linkedTableId || undefined,
        commandId: linkedCommandId || undefined,
        notes: form.notes || undefined,
        delivery:
          form.orderType === 'delivery' && customerAddressId
            ? {
                customerAddressId,
              }
            : undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        payments: [
          {
            paymentMethod: form.paymentMethod,
            amount: total,
          },
        ],
      });

      showToast('Pedido criado com sucesso', 'success');
      setCart([]);
      setForm({
        customerId: '',
        customerAddressId: '',
        orderType: (initialOrderType ?? 'delivery') as OrderType,
        channel: initialChannel,
        tableId: initialTableId ?? '',
        commandId: initialCommandId ?? '',
        paymentMethod: 'pix',
        notes: '',
        useNewAddress: false,
      });
      setNewAddress({
        zipCode: '',
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        reference: '',
        deliveryAreaId: undefined,
        ibgeCode: undefined,
      });
      setDeliveryInfo(null);
    } catch (error: any) {
      showToast(error.message || 'Erro ao criar pedido', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialTableId) {
      setLinkedTableId(initialTableId);
      setForm((prev) => ({ ...prev, orderType: 'table' }));
    }

    if (initialCommandId) {
      setLinkedCommandId(initialCommandId);
      setForm((prev) => ({ ...prev, orderType: 'command', channel: initialChannel }));
    }
  }, [initialTableId, initialCommandId, initialChannel]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Informações do pedido</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <select
              value={form.customerId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  customerId: e.target.value,
                  customerAddressId: '',
                  useNewAddress: false,
                }))
              }
              className="rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="">Selecione o cliente</option>
              {customers.map((customer: any) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>

            <select
              value={form.orderType}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  orderType: e.target.value as OrderType,
                }))
              }
              className="rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="delivery">Delivery</option>
              <option value="counter">Balcão</option>
              <option value="pickup">Retirada</option>
              <option value="whatsapp">WhatsApp</option>
            </select>

            {form.orderType === 'delivery' ? (
              <div className="space-y-4 md:col-span-2">
                <select
                  value={form.customerAddressId}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      customerAddressId: e.target.value,
                      useNewAddress: false,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  disabled={form.useNewAddress}
                >
                  <option value="">Selecione o endereço</option>
                  {addresses.map((address: any) => (
                    <option key={address.id} value={address.id}>
                      {address.street}, {address.number} - {address.district}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.useNewAddress}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        useNewAddress: e.target.checked,
                        customerAddressId: '',
                      }))
                    }
                  />
                  Usar novo endereço por CEP
                </label>

                {form.useNewAddress ? (
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          value={newAddress.zipCode}
                          onChange={(e) =>
                            setNewAddress((prev) => ({ ...prev, zipCode: e.target.value }))
                          }
                          placeholder="CEP"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={lookupZipCode}
                        disabled={zipCodeLoading}
                        className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                      >
                        {zipCodeLoading ? 'Buscando...' : 'Buscar'}
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, street: e.target.value }))
                        }
                        placeholder="Rua"
                        className="rounded-xl border border-slate-300 px-4 py-3"
                      />
                      <input
                        value={newAddress.number}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, number: e.target.value }))
                        }
                        placeholder="Número"
                        className="rounded-xl border border-slate-300 px-4 py-3"
                      />
                      <input
                        value={newAddress.complement}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, complement: e.target.value }))
                        }
                        placeholder="Complemento"
                        className="rounded-xl border border-slate-300 px-4 py-3"
                      />
                      <input
                        value={newAddress.district}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, district: e.target.value }))
                        }
                        placeholder="Bairro"
                        className="rounded-xl border border-slate-300 px-4 py-3"
                      />
                      <input
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, city: e.target.value }))
                        }
                        placeholder="Cidade"
                        className="rounded-xl border border-slate-300 px-4 py-3"
                      />
                      <input
                        value={newAddress.state}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, state: e.target.value }))
                        }
                        placeholder="Estado"
                        className="rounded-xl border border-slate-300 px-4 py-3"
                      />
                      <input
                        value={newAddress.reference}
                        onChange={(e) =>
                          setNewAddress((prev) => ({ ...prev, reference: e.target.value }))
                        }
                        placeholder="Referência"
                        className="rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
                      />
                    </div>

                    {deliveryInfo ? (
                      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                        <p>
                          {deliveryInfo.supported
                            ? `Atendemos: ${deliveryInfo.deliveryAreaName ?? '-'}`
                            : 'CEP fora da área de entrega'}
                        </p>
                        {deliveryInfo.supported ? (
                          <>
                            <p className="mt-1">
                              Taxa: R$ {Number(deliveryInfo.deliveryFee ?? 0).toFixed(2)}
                            </p>
                            <p className="mt-1">
                              Prazo: {deliveryInfo.estimatedMinutes ?? 0} min
                            </p>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <select
              value={form.paymentMethod}
              onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
              className="rounded-xl border border-slate-300 px-4 py-3"
            >
              <option value="pix">Pix</option>
              <option value="credit">Crédito</option>
              <option value="debit">Débito</option>
              <option value="cash">Dinheiro</option>
            </select>

            <input
              value={form.channel}
              onChange={(e) => setForm((prev) => ({ ...prev, channel: e.target.value }))}
              className="rounded-xl border border-slate-300 px-4 py-3"
              placeholder="Canal"
            />

            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações"
              className="min-h-[110px] rounded-xl border border-slate-300 px-4 py-3 md:col-span-2"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Produtos</h2>
            <StatusBadge status={form.orderType} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product: any) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-400"
              >
                <h3 className="font-medium text-slate-900">{product.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  R$ {Number(product.salePrice ?? 0).toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky top-6 h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Carrinho</h2>

        <div className="mt-4 space-y-4">
          {cart.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum item no carrinho.</p>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="border-b border-slate-100 pb-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">R$ {item.unitPrice.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-8 w-8 rounded-lg border border-slate-300"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="h-8 w-8 rounded-lg border border-slate-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          {form.orderType === 'delivery' && deliveryInfo?.supported ? (
            <div className="mt-2 flex justify-between text-sm text-slate-600">
              <span>Entrega</span>
              <span>R$ {Number(deliveryInfo.deliveryFee ?? 0).toFixed(2)}</span>
            </div>
          ) : null}
          {form.orderType === 'delivery' && deliveryInfo?.supported ? (
            <div className="mt-2 flex justify-between font-semibold text-slate-900">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          ) : null}

          <button
            onClick={handleSubmit}
            disabled={loading || !cart.length}
            className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? 'Criando pedido...' : 'Criar pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}
