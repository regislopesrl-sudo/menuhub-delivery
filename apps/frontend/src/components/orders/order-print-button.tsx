'use client';

export function OrderPrintButton({ order }: { order: any }) {
  function handlePrint() {
    const content = `
      <html>
        <head>
          <title>Pedido #${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin-bottom: 8px; }
            .muted { color: #666; margin-bottom: 16px; }
            .item { margin-bottom: 8px; }
            .total { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Pedido #${order.orderNumber}</h1>
          <div class="muted">
            Cliente: ${order.customer?.name ?? 'Sem cliente'}<br/>
            Status: ${order.status}<br/>
            Canal: ${order.channel}
          </div>
          <h3>Itens</h3>
          ${(order.items ?? [])
            .map(
              (item: any) =>
                `<div class="item">${Number(item.quantity)}x ${item.productNameSnapshot} - R$ ${Number(item.totalPrice ?? 0).toFixed(2)}</div>`,
            )
            .join('')}
          <div class="total">Total: R$ ${Number(order.totalAmount ?? 0).toFixed(2)}</div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  return (
    <button
      onClick={handlePrint}
      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      Imprimir pedido
    </button>
  );
}
