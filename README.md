# Sistema Delivery Futuro

Workspace paralelo, criado do zero, para evoluir o novo stack sem interferir no sistema atual.

## Stack

- Frontend: Next.js + TypeScript + Tailwind
- Backend: NestJS + TypeScript + Prisma
- Banco: PostgreSQL
- Cache: Redis

## Portas deste workspace

- Backend: `3100`
- Frontend: `3101`
- Postgres: `5434`
- Redis: `6381`

## Setup local

1. Backend:

```bash
cp apps/backend/.env.example apps/backend/.env
```

2. Frontend:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
```

3. Infra:

```bash
docker compose up -d postgres redis
```

4. Instalar dependencias:

```bash
npm install
```

5. Prisma:

```bash
npm run prisma:generate
npm run db:push
npm run seed
```

6. Subir apps:

```bash
npm run dev:backend
npm run dev:frontend
```

## Validacao rapida

- Backend health: `http://127.0.0.1:3100/health`
- Frontend: `http://127.0.0.1:3101`

## Usuarios seed

- `admin@exemplo.com` / `123456`
- `gerente@exemplo.com` / `123456`
- `atendente@exemplo.com` / `123456`
- `cozinha@exemplo.com` / `123456`
- `financeiro@exemplo.com` / `123456`
- `estoque@exemplo.com` / `123456`

## Estado atual deste workspace

- backend NestJS + Prisma compilando e respondendo healthcheck
- frontend Next.js compilando e servindo em porta isolada
- auth com `login`, `refresh`, `logout` e `me`
- rotas iniciais de `companies`, `branches` e `settings`
- rotas iniciais de `addon-groups` e `combos`
- rotas iniciais de `tables`, `commands` e `reservations`
- rotas iniciais de `waitlist`, `suppliers` e `coupons`
- seed inicial com empresa, filial, permissoes, roles, usuarios e catalogo basico

## Objetivo deste workspace

- consolidar o backend futuro em Prisma
- consolidar o frontend futuro com painel admin e cardapio digital
- manter o sistema atual intacto
# menuhub-delivery
