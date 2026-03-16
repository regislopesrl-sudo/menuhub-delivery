'use client';

export function CommandPrintButton({ command }: { command: any }) {
  function handlePrint() {
    const total = (command.orders ?? []).reduce(
      (acc: number, order: any) => acc + Number(order.totalAmount ?? 0),
      0,
    );

    const content = `
      <html>
        <head>
          <title>Comanda ${command.code}</title>
          <style>
            body { font-family: monospace; width: 80mm; padding: 8px; font-size: 12px; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .item { margin-bottom: 8px; }
            .title { font-size: 16px; font-weight: bold; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="title">COMANDA ${command.code}</div>
          <div>Cliente: ${command.customer?.name ?? 'Sem cliente'}</div>
          <div>Abertura: ${
            command.openedAt ? new Date(command.openedAt).toLocaleString('pt-BR') : '-'
          }</div>
          <div class="line"></div>
          ${(command.orders ?? [])
            .map(
              (order: any) => `
                <div class="item">
                  <div><strong>Pedido #${order.orderNumber}</strong></div>
                  ${(order.items ?? [])
                    .map(
                      (item: any) =>
                        `<div>${Number(item.quantity)}x ${item.productNameSnapshot}</div>`,
                    )
                    .join('')}
                  <div>Total pedido: R$ ${Number(order.totalAmount ?? 0).toFixed(2)}</div>
                </div>
                <div class="line"></div>
              `,
            )
            .join('')}
          <div><strong>Total da comanda: R$ ${total.toFixed(2)}</strong></div>
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
      Imprimir comanda
    </button>
  );
}
