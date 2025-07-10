# 🔧 Configuração de Variáveis de Ambiente

## 📁 Arquivo `.env` (Crie na raiz do projeto)

Crie um arquivo chamado `.env` na raiz do projeto (mesmo nível do package.json) com o seguinte conteúdo:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://SEU-PROJETO.supabase.co
REACT_APP_SUPABASE_ANON_KEY=SUA-CHAVE-ANONIMA-AQUI

# PWA Configuration
PUBLIC_URL=

# Generate source maps
GENERATE_SOURCEMAP=false
```

## 🔑 Como obter as credenciais do Supabase:

1. **Acesse seu projeto no Supabase Dashboard**
2. **Vá em Settings > API**
3. **Copie os valores:**
   - **Project URL** → Substitua `REACT_APP_SUPABASE_URL`
   - **Project API keys > anon public** → Substitua `REACT_APP_SUPABASE_ANON_KEY`

## ⚠️ **Importante:**

- **NÃO** committe o arquivo `.env` no git
- O arquivo `.env` já está no `.gitignore`
- Cada desenvolvedor deve ter seu próprio `.env`

## 📝 **Exemplo real:**

```env
REACT_APP_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY4ODU2NzY4MCwiZXhwIjoyMDA0MTQzNjgwfQ.exemplo-de-token-jwt
PUBLIC_URL=
GENERATE_SOURCEMAP=false
```

Após criar o arquivo `.env`, execute:

```bash
npm start
``` 