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

## Resumo para retomar amanhã

1. Projeto sincronizado com `regislopesrl-sudo/menuhub-delivery`, incluindo backend, frontend, Dockerfiles, scripts e documentação.  
2. Scripts `check-redis.sh`, `deploy.sh`, `sync-and-deploy.sh` e `deploy-para-menuhub.sh` criados para diagnosticar Redis, buildar, transferir o tar e validar health/nginx.  
3. Chave `~/.ssh/menuhub_deploy` gerada e secrets `MENUHUB_SSH_USER/HOST/KEY` configurados no GitHub; workflow `.github/workflows/deploy.yml` usa `runs-on: [self-hosted, linux]`.  
4. Runner self-hosted instalado no host com acesso ao servidor (`./run.sh`/`svc.sh`) para executar os jobs da Actions.  
5. Push final executado; o workflow dispara no runner local sempre que houver `git push origin main`.

## Checklist para amanhã

1. Abra **Actions > Deploy Menuhub** e confirme que o pipeline mais recente foi executado com sucesso no runner self-hosted.  
2. Se precisar de um deploy manual, use `git pull origin main` seguido de `./scripts/deploy-para-menuhub.sh`.  
3. Execute `./scripts/check-redis.sh` no servidor para diagnosticar o Redis/backend quando quiser.  
4. Após cada deploy confirme os endpoints públicos `https://api.menuhub.net.br/health` e `/api/health`.  
5. Qualquer nova alteração deve ser commitada/pushada; o workflow cuidará do deploy automaticamente e pode ser monitorado em tempo real.
