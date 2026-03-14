const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

const DEFAULT_COMPANY_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000001';

const PERMISSIONS = [
  ['dashboard.view', 'Visualizar dashboard'],
  ['users.view', 'Visualizar usuarios'],
  ['users.create', 'Criar usuarios'],
  ['users.update', 'Atualizar usuarios'],
  ['users.toggle_active', 'Ativar e inativar usuarios'],
  ['roles.view', 'Visualizar perfis'],
  ['roles.create', 'Criar perfis'],
  ['roles.update', 'Atualizar perfis'],
  ['companies.view', 'Visualizar empresa'],
  ['companies.update', 'Atualizar empresa'],
  ['branches.view', 'Visualizar filiais'],
  ['branches.create', 'Criar filiais'],
  ['branches.update', 'Atualizar filiais'],
  ['settings.view', 'Visualizar configuracoes'],
  ['settings.update', 'Atualizar configuracoes'],
  ['categories.view', 'Visualizar categorias'],
  ['categories.create', 'Criar categorias'],
  ['categories.update', 'Atualizar categorias'],
  ['products.view', 'Visualizar produtos'],
  ['products.create', 'Criar produtos'],
  ['products.update', 'Atualizar produtos'],
  ['products.toggle', 'Ativar e inativar produtos'],
  ['addons.view', 'Visualizar adicionais'],
  ['addons.create', 'Criar adicionais'],
  ['addons.update', 'Atualizar adicionais'],
  ['combos.view', 'Visualizar combos'],
  ['combos.create', 'Criar combos'],
  ['combos.update', 'Atualizar combos'],
  ['customers.view', 'Visualizar clientes'],
  ['customers.create', 'Criar clientes'],
  ['customers.update', 'Atualizar clientes'],
  ['orders.view', 'Visualizar pedidos'],
  ['orders.create', 'Criar pedidos'],
  ['orders.update', 'Atualizar pedidos'],
  ['orders.change_status', 'Alterar status de pedidos'],
  ['orders.cancel', 'Cancelar pedidos'],
  ['tables.view', 'Visualizar mesas'],
  ['tables.open', 'Abrir mesas'],
  ['tables.close', 'Fechar mesas'],
  ['tables.update', 'Atualizar mesas'],
  ['commands.view', 'Visualizar comandas'],
  ['commands.open', 'Abrir comandas'],
  ['commands.add_item', 'Adicionar itens em comandas'],
  ['commands.close', 'Fechar comandas'],
  ['reservations.view', 'Visualizar reservas'],
  ['reservations.create', 'Criar reservas'],
  ['reservations.update', 'Atualizar reservas'],
  ['coupons.view', 'Visualizar cupons'],
  ['coupons.create', 'Criar cupons'],
  ['coupons.update', 'Atualizar cupons'],
  ['stock.view', 'Visualizar estoque'],
  ['stock.create', 'Criar itens de estoque'],
  ['stock.update', 'Atualizar estoque'],
  ['stock.adjust', 'Ajustar estoque'],
  ['stock.manage_batches', 'Gerenciar lotes'],
  ['stock.register_loss', 'Registrar perdas'],
  ['stock.view_costs', 'Visualizar custos de estoque'],
  ['purchasing.view', 'Visualizar compras'],
  ['purchasing.request_create', 'Criar solicitacoes de compra'],
  ['purchasing.order_create', 'Criar pedidos de compra'],
  ['purchasing.order_approve', 'Aprovar pedidos de compra'],
  ['purchasing.receipt_create', 'Criar recebimentos'],
  ['purchasing.receipt_finalize', 'Finalizar recebimentos'],
  ['financial.view', 'Visualizar financeiro'],
  ['financial.cash_open', 'Abrir caixa'],
  ['financial.cash_close', 'Fechar caixa'],
  ['financial.cash_movement', 'Registrar movimentos de caixa'],
  ['financial.accounts_payable', 'Gerenciar contas a pagar'],
  ['financial.accounts_receivable', 'Gerenciar contas a receber'],
  ['reviews.view', 'Visualizar reviews'],
  ['reviews.create', 'Criar reviews'],
  ['reviews.handle', 'Tratar reviews'],
  ['reviews.reply', 'Responder reviews'],
];

const ROLES = {
  SUPER_ADMIN: PERMISSIONS.map(([code]) => code),
  GERENTE: [
    'dashboard.view',
    'companies.view',
    'companies.update',
    'branches.view',
    'branches.create',
    'branches.update',
    'settings.view',
    'settings.update',
    'categories.view',
    'categories.create',
    'categories.update',
    'products.view',
    'products.create',
    'products.update',
    'products.toggle',
    'addons.view',
    'addons.create',
    'addons.update',
    'combos.view',
    'combos.create',
    'combos.update',
    'customers.view',
    'customers.create',
    'customers.update',
    'orders.view',
    'orders.create',
    'orders.update',
    'orders.change_status',
    'orders.cancel',
    'tables.view',
    'tables.open',
    'tables.close',
    'tables.update',
    'commands.view',
    'commands.open',
    'commands.add_item',
    'commands.close',
    'reservations.view',
    'reservations.create',
    'reservations.update',
    'coupons.view',
    'coupons.create',
    'coupons.update',
    'stock.view',
    'stock.adjust',
    'stock.view_costs',
    'purchasing.view',
    'financial.view',
    'reviews.view',
    'reviews.create',
    'reviews.handle',
    'reviews.reply',
  ],
  ATENDENTE: [
    'dashboard.view',
    'companies.view',
    'branches.view',
    'settings.view',
    'categories.view',
    'products.view',
    'addons.view',
    'combos.view',
    'customers.view',
    'customers.create',
    'customers.update',
    'orders.view',
    'orders.create',
    'orders.update',
    'orders.change_status',
    'orders.cancel',
    'tables.view',
    'tables.open',
    'tables.close',
    'commands.view',
    'commands.open',
    'commands.add_item',
    'commands.close',
    'reservations.view',
    'reservations.create',
    'coupons.view',
    'reviews.view',
    'reviews.create',
    ],
  COZINHA: ['orders.view', 'orders.change_status', 'dashboard.view'],
  FINANCEIRO: [
    'dashboard.view',
    'financial.view',
    'financial.cash_open',
    'financial.cash_close',
    'financial.cash_movement',
    'financial.accounts_payable',
    'financial.accounts_receivable',
    'orders.view',
    'purchasing.view',
    'reviews.view',
  ],
  ESTOQUE: [
    'stock.view',
    'stock.create',
    'stock.update',
    'stock.adjust',
    'stock.manage_batches',
    'stock.register_loss',
    'stock.view_costs',
    'purchasing.view',
    'purchasing.request_create',
    'purchasing.receipt_create',
    'purchasing.receipt_finalize',
  ],
};

const USERS = [
  ['admin@exemplo.com', 'Administrador', 'SUPER_ADMIN'],
  ['gerente@exemplo.com', 'Gerente', 'GERENTE'],
  ['atendente@exemplo.com', 'Atendente', 'ATENDENTE'],
  ['cozinha@exemplo.com', 'Cozinha', 'COZINHA'],
  ['financeiro@exemplo.com', 'Financeiro', 'FINANCEIRO'],
  ['estoque@exemplo.com', 'Estoque', 'ESTOQUE'],
];

async function seedPermissions() {
  for (const [code, description] of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code },
      update: { description },
      create: { code, description },
    });
  }
}

async function seedRoles() {
  const permissionMap = new Map(
    (await prisma.permission.findMany()).map((permission) => [permission.code, permission.id]),
  );

  for (const [name, permissionCodes] of Object.entries(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {
        description: `Perfil ${name}`,
      },
      create: {
        name,
        description: `Perfil ${name}`,
      },
    });

    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    if (permissionCodes.length) {
      await prisma.rolePermission.createMany({
        data: permissionCodes.map((code) => ({
          roleId: role.id,
          permissionId: permissionMap.get(code),
        })),
        skipDuplicates: true,
      });
    }
  }
}

async function seedCompany() {
  await prisma.company.upsert({
    where: { id: DEFAULT_COMPANY_ID },
    update: {
      legalName: 'Sistema Delivery Futuro LTDA',
      tradeName: 'Sistema Delivery Futuro',
      cnpj: '00000000000191',
      email: 'contato@exemplo.com',
      phone: '91999999999',
      whatsapp: '91999999999',
    },
    create: {
      id: DEFAULT_COMPANY_ID,
      legalName: 'Sistema Delivery Futuro LTDA',
      tradeName: 'Sistema Delivery Futuro',
      cnpj: '00000000000191',
      email: 'contato@exemplo.com',
      phone: '91999999999',
      whatsapp: '91999999999',
    },
  });

  await prisma.branch.upsert({
    where: { id: DEFAULT_BRANCH_ID },
    update: {
      companyId: DEFAULT_COMPANY_ID,
      name: 'Unidade Matriz',
      code: 'MAT',
      city: 'Belem',
      state: 'PA',
      phone: '91999999999',
      whatsapp: '91999999999',
      email: 'matriz@exemplo.com',
    },
    create: {
      id: DEFAULT_BRANCH_ID,
      companyId: DEFAULT_COMPANY_ID,
      name: 'Unidade Matriz',
      code: 'MAT',
      city: 'Belem',
      state: 'PA',
      phone: '91999999999',
      whatsapp: '91999999999',
      email: 'matriz@exemplo.com',
    },
  });
}

async function seedUsers() {
  const passwordHash = await hash('123456', 10);
  const roleMap = new Map((await prisma.role.findMany()).map((role) => [role.name, role.id]));

  for (const [email, name, roleName] of USERS) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        passwordHash,
        isActive: true,
      },
      create: {
        name,
        email,
        passwordHash,
        isActive: true,
      },
    });

    await prisma.userRole.deleteMany({
      where: { userId: user.id },
    });

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: roleMap.get(roleName),
      },
    });
  }
}

async function seedCatalog() {
  const category = await prisma.category.upsert({
    where: {
      id: '10000000-0000-0000-0000-000000000001',
    },
    update: {
      companyId: DEFAULT_COMPANY_ID,
      name: 'Pastéis',
      sortOrder: 1,
      isActive: true,
    },
    create: {
      id: '10000000-0000-0000-0000-000000000001',
      companyId: DEFAULT_COMPANY_ID,
      name: 'Pastéis',
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: {
      id: '20000000-0000-0000-0000-000000000001',
    },
    update: {
      companyId: DEFAULT_COMPANY_ID,
      categoryId: category.id,
      name: 'Pastel de Carne',
      description: 'Pastel classico de carne',
      salePrice: 12,
      costPrice: 5,
      isActive: true,
    },
    create: {
      id: '20000000-0000-0000-0000-000000000001',
      companyId: DEFAULT_COMPANY_ID,
      categoryId: category.id,
      name: 'Pastel de Carne',
      description: 'Pastel classico de carne',
      salePrice: 12,
      costPrice: 5,
      isActive: true,
    },
  });

  const addonGroup = await prisma.addonGroup.upsert({
    where: {
      id: '30000000-0000-0000-0000-000000000001',
    },
    update: {
      companyId: DEFAULT_COMPANY_ID,
      name: 'Adicionais Tradicionais',
      minSelect: 0,
      maxSelect: 3,
      required: false,
      allowMultiple: true,
    },
    create: {
      id: '30000000-0000-0000-0000-000000000001',
      companyId: DEFAULT_COMPANY_ID,
      name: 'Adicionais Tradicionais',
      minSelect: 0,
      maxSelect: 3,
      required: false,
      allowMultiple: true,
    },
  });

  await prisma.addonItem.deleteMany({
    where: {
      groupId: addonGroup.id,
    },
  });

  await prisma.addonItem.createMany({
    data: [
      {
        groupId: addonGroup.id,
        name: 'Queijo extra',
        price: 3,
        sortOrder: 1,
        isActive: true,
      },
      {
        groupId: addonGroup.id,
        name: 'Bacon',
        price: 4,
        sortOrder: 2,
        isActive: true,
      },
    ],
  });

  await prisma.productAddonGroup.upsert({
    where: {
      productId_addonGroupId: {
        productId: '20000000-0000-0000-0000-000000000001',
        addonGroupId: addonGroup.id,
      },
    },
    update: {},
    create: {
      productId: '20000000-0000-0000-0000-000000000001',
      addonGroupId: addonGroup.id,
    },
  });

  const combo = await prisma.combo.upsert({
    where: {
      id: '40000000-0000-0000-0000-000000000001',
    },
    update: {
      companyId: DEFAULT_COMPANY_ID,
      name: 'Combo Classico',
      description: 'Pastel de carne com refrigerante',
      price: 18,
      isActive: true,
    },
    create: {
      id: '40000000-0000-0000-0000-000000000001',
      companyId: DEFAULT_COMPANY_ID,
      name: 'Combo Classico',
      description: 'Pastel de carne com refrigerante',
      price: 18,
      isActive: true,
    },
  });

  await prisma.comboItem.deleteMany({
    where: {
      comboId: combo.id,
    },
  });

  await prisma.comboItem.create({
    data: {
      comboId: combo.id,
      productId: '20000000-0000-0000-0000-000000000001',
      quantity: 1,
    },
  });
}

async function seedSettings() {
  const items = [
    {
      key: 'general',
      value: {
        timezone: 'America/Belem',
        currency: 'BRL',
        orderPrefix: 'PED',
      },
    },
    {
      key: 'kds',
      value: {
        autoRefreshSeconds: 15,
        soundEnabled: true,
      },
    },
  ];

  for (const item of items) {
    await prisma.companySetting.upsert({
      where: {
        companyId_branchId_key: {
          companyId: DEFAULT_COMPANY_ID,
          branchId: DEFAULT_BRANCH_ID,
          key: item.key,
        },
      },
      update: {
        value: item.value,
      },
      create: {
        companyId: DEFAULT_COMPANY_ID,
        branchId: DEFAULT_BRANCH_ID,
        key: item.key,
        value: item.value,
      },
    });
  }
}

async function seedSalon() {
  const tables = [
    ['50000000-0000-0000-0000-000000000001', 'Mesa 1', 4, 'qr-mesa-1'],
    ['50000000-0000-0000-0000-000000000002', 'Mesa 2', 4, 'qr-mesa-2'],
    ['50000000-0000-0000-0000-000000000003', 'Mesa 3', 2, 'qr-mesa-3'],
  ];

  for (const [id, name, capacity, qrCode] of tables) {
    await prisma.tableRestaurant.upsert({
      where: { id },
      update: {
        branchId: DEFAULT_BRANCH_ID,
        name,
        capacity,
        qrCode,
        status: 'FREE',
      },
      create: {
        id,
        branchId: DEFAULT_BRANCH_ID,
        name,
        capacity,
        qrCode,
        status: 'FREE',
      },
    });
  }

  await prisma.reservation.upsert({
    where: { id: '60000000-0000-0000-0000-000000000001' },
    update: {
      branchId: DEFAULT_BRANCH_ID,
      tableId: '50000000-0000-0000-0000-000000000001',
      guestName: 'Cliente Reserva',
      guestPhone: '91999990000',
      guestCount: 4,
      reservationAt: new Date('2026-03-14T22:00:00.000Z'),
      status: 'booked',
      notes: 'Reserva seed',
    },
    create: {
      id: '60000000-0000-0000-0000-000000000001',
      branchId: DEFAULT_BRANCH_ID,
      tableId: '50000000-0000-0000-0000-000000000001',
      guestName: 'Cliente Reserva',
      guestPhone: '91999990000',
      guestCount: 4,
      reservationAt: new Date('2026-03-14T22:00:00.000Z'),
      status: 'booked',
      notes: 'Reserva seed',
    },
  });

  await prisma.waitlist.upsert({
    where: { id: '70000000-0000-0000-0000-000000000001' },
    update: {
      branchId: DEFAULT_BRANCH_ID,
      guestName: 'Cliente Fila',
      guestPhone: '91999991111',
      guestCount: 2,
      status: 'waiting',
      notes: 'Aguardando mesa',
    },
    create: {
      id: '70000000-0000-0000-0000-000000000001',
      branchId: DEFAULT_BRANCH_ID,
      guestName: 'Cliente Fila',
      guestPhone: '91999991111',
      guestCount: 2,
      status: 'waiting',
      notes: 'Aguardando mesa',
    },
  });
}

async function seedCommercial() {
  await prisma.supplier.upsert({
    where: { id: '80000000-0000-0000-0000-000000000001' },
    update: {
      companyId: DEFAULT_COMPANY_ID,
      name: 'Fornecedor Base',
      document: '12345678000100',
      phone: '91988887777',
      email: 'fornecedor@exemplo.com',
      notes: 'Fornecedor seed',
    },
    create: {
      id: '80000000-0000-0000-0000-000000000001',
      companyId: DEFAULT_COMPANY_ID,
      name: 'Fornecedor Base',
      document: '12345678000100',
      phone: '91988887777',
      email: 'fornecedor@exemplo.com',
      notes: 'Fornecedor seed',
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'BEMVINDO10' },
    update: {
      companyId: DEFAULT_COMPANY_ID,
      discountType: 'percentage',
      discountValue: 10,
      minimumOrderAmount: 20,
      firstOrderOnly: true,
      isActive: true,
    },
    create: {
      companyId: DEFAULT_COMPANY_ID,
      code: 'BEMVINDO10',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrderAmount: 20,
      firstOrderOnly: true,
      isActive: true,
    },
  });
}

async function main() {
  await seedPermissions();
  await seedRoles();
  await seedCompany();
  await seedUsers();
  await seedCatalog();
  await seedSalon();
  await seedSettings();
  await seedCommercial();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed concluido com sucesso.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
