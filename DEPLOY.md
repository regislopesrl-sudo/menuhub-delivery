# Deploy para o ambiente Menuhub

Este repositório centraliza a versão que vai para o servidor `menuhub`. Siga os passos abaixo antes de cada deploy de produção:

1. **Atualize o código local**

```bash
cd ~/sistema-delivery-futuro
git pull origin main
```

2. **Execute o deploy local → remoto**

```bash
./scripts/deploy-para-menuhub.sh
```

O script automatiza:

- criação do tar `/tmp/local-sistema.tar.gz` com o conteúdo do repositório;
- transferência para `regisadmin@46.224.226.72` via `scp`;
- execução remota de `./scripts/sync-and-deploy.sh`, que faz `rsync` → `./scripts/deploy.sh` → testes de health;
- recarrega o Nginx e valida `https://api.menuhub.net.br/health` e `/api/health`.

3. **Caso precise reexecutar só o deploy remoto**

```bash
ssh regisadmin@46.224.226.72 "cd /home/regis/sistema-delivery-futuro && ./scripts/deploy.sh"
```

4. **Para validar o Redis**

```bash
ssh regisadmin@46.224.226.72 "cd /home/regis/sistema-delivery-futuro && ./scripts/check-redis.sh"
```

5. **Observações**

- Sempre confirme `curl -i https://api.menuhub.net.br/health` após o deploy para garantir que o nginx esteja em funcionamento.
- Use `git push origin main` assim que novas alterações forem aprovadas; o script de deploy sempre parte do estado atual do branch `main`.
