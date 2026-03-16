'use client';

export function OrderThermalPrintButton({
  order,
  mode = 'kitchen',
}: {
  order: any;
  mode?: 'kitchen' | 'counter';
}) {
  function handlePrint() {
    const title = mode === 'kitchen' ? 'COZINHA' : 'BALCÃO';

    const content = `
      <html>
        <head>
          <title>${title} - Pedido #${order.orderNumber}</title>
          <style>
            body {
              font-family: monospace;
              width: 80mm;
              padding: 8px;
              font-size: 12px;
            }
            h1,h2,p { margin: 0 0 6px 0; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .item { margin-bottom: 8px; }
            .big { font-size: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p class="big">PEDIDO #${order.orderNumber}</p>
          <p>Cliente: ${order.customer?.name ?? 'Sem cliente'}</p>
          <p>Canal: ${order.channel}</p>
          <p>Tipo: ${order.orderType}</p>
          <div class="line"></div>
          ${(order.items ?? [])
            .map(
              (item: any) => `
                <div class="item">
                  <div><strong>${Number(item.quantity)}x ${item.productNameSnapshot}</strong></div>
                  ${item.notes ? `<div>Obs: ${item.notes}</div>` : ''}
                  ${(item.addons ?? [])
                    .map((addon: any) => `<div>+ ${addon.nameSnapshot}</div>`)
                    .join('')}
                </div>
              `,
            )
            .join('')}
          <div class="line"></div>
          <p>Total: R$ ${Number(order.totalAmount ?? 0).toFixed(2)}</p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=700');
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
      Imprimir {mode === 'kitchen' ? 'cozinha' : 'balcão'}
    </button>
  );
}
