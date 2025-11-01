# 🚂 Deploy Rápido no Railway

## Opção 1: Deploy via GitHub (Recomendado - Mais Fácil)

### 1. Acesse Railway
1. Vá em https://railway.app
2. Faça login com sua conta GitHub
3. Clique em **"New Project"**

### 2. Conecte o Repositório
1. Selecione **"Deploy from GitHub repo"**
2. Escolha o repositório **gfcampos1/Instrumenta-Sin**
3. Clique em **"Deploy Now"**

### 3. Adicione o Banco de Dados
1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. Railway criará automaticamente a `DATABASE_URL`

### 4. Configure as Variáveis de Ambiente
No painel do Railway, vá em **Variables** e adicione:

```bash
NEXTAUTH_SECRET=sua-chave-super-secreta-aqui-32-chars
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NODE_ENV=production
```

**⚠️ IMPORTANTE:** Para gerar o `NEXTAUTH_SECRET`:
```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 5. Execute as Migrations
1. No Railway, vá em **"Deployments"**
2. Aguarde o build terminar
3. Clique em **"Settings"** → **"Deploy"**
4. Execute no terminal local para aplicar migrations:

```powershell
# Instale Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Execute migrations
railway run npx prisma migrate deploy

# Execute seed (dados iniciais)
railway run npx prisma db seed
```

### 6. Acesse o App
- Clique em **"Settings"** → **"Generate Domain"**
- Seu app estará em: `https://seu-app.up.railway.app`

---

## Opção 2: Deploy via CLI (Avançado)

```powershell
# 1. Instale Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicialize projeto
railway init

# 4. Adicione PostgreSQL
railway add -d postgres

# 5. Configure variáveis
railway variables set NEXTAUTH_SECRET="sua-chave-aqui"
railway variables set NODE_ENV="production"

# 6. Deploy
railway up

# 7. Execute migrations
railway run npx prisma migrate deploy
railway run npx prisma db seed

# 8. Abra no browser
railway open
```

---

## ✅ Checklist de Deploy

- [ ] Projeto criado no Railway
- [ ] Repositório GitHub conectado
- [ ] PostgreSQL adicionado
- [ ] Variável `NEXTAUTH_SECRET` configurada
- [ ] Variável `NEXTAUTH_URL` configurada
- [ ] Build concluído com sucesso
- [ ] Migrations executadas (`railway run npx prisma migrate deploy`)
- [ ] Seed executado (`railway run npx prisma db seed`)
- [ ] Domain gerado
- [ ] App acessível no browser

---

## 🔧 Troubleshooting

### Erro: "Build failed"
```bash
# Verifique os logs
railway logs

# Force rebuild
railway up --detach
```

### Erro: "Database connection failed"
```bash
# Verifique se DATABASE_URL está configurada
railway variables

# Teste conexão
railway run npx prisma db push
```

### Erro: "NEXTAUTH_SECRET not set"
```bash
# Configure a variável
railway variables set NEXTAUTH_SECRET="sua-chave-de-32-caracteres"
```

### Migrations não aplicadas
```bash
# Execute manualmente
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

---

## 📊 Custos Estimados

- **Hobby Plan (Free):** $0/mês
  - 500 horas de execução
  - PostgreSQL incluído
  - Perfeito para desenvolvimento

- **Developer Plan:** $5/mês
  - Execução ilimitada
  - Mais recursos
  - Ideal para produção pequena

---

## 🎯 Próximos Passos Após Deploy

1. **Teste o Login:**
   - Admin: `admin@sintegra.com` / `admin123`
   - User: `joao@sintegra.com` / `user123`

2. **Configure Cloudinary (Opcional):**
   ```bash
   railway variables set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu-cloud"
   railway variables set CLOUDINARY_API_KEY="sua-key"
   railway variables set CLOUDINARY_API_SECRET="seu-secret"
   ```

3. **Configure Domain Customizado (Opcional):**
   - Railway Settings → Custom Domain
   - Adicione seu domínio

4. **Monitore a Aplicação:**
   - Railway Dashboard → Metrics
   - Veja uso de CPU, RAM, Network

---

**Deploy esperado:** ⏱️ 3-5 minutos

**Dificuldade:** ⭐⭐ (Fácil)

**Desenvolvido com 💙 pela Sintegra**
