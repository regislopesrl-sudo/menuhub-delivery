#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "1. Atualizando dependências e compilando"
npm install
npm run build

echo
echo "2. Subindo containers essenciais"
docker compose up -d postgres redis backend

echo
echo "3. Status dos serviços"
docker compose ps

echo
echo "4. Teste rápido de health"
docker compose exec -T redis redis-cli PING
docker compose exec -T backend sh -c 'curl -f http://localhost:3100/health || true'

echo
echo "Deploy concluído."
