# 🚨 RESOLVER ERRO "Database error creating new user"

## 📋 PASSO A PASSO PARA RESOLVER

### **ETAPA 1: DIAGNÓSTICO COMPLETO**

1. **Abra o Supabase Dashboard** (https://app.supabase.com)
2. **Vá para SQL Editor** (barra lateral esquerda)
3. **Clique em "New Query"**
4. **Copie e cole o arquivo `diagnostico-completo.sql`**
5. **Clique em "RUN"** e aguarde os resultados

### **ETAPA 2: ANALISAR OS RESULTADOS**

**Verifique se:**
- ✅ Extensão `uuid-ossp` está instalada
- ✅ Tabela `user_profiles` existe
- ✅ Colunas da tabela estão corretas
- ✅ Não há políticas RLS em conflito
- ✅ Trigger `on_auth_user_created` existe
- ✅ Função `create_user_profile()` existe

### **ETAPA 3: CORREÇÃO RADICAL**

Se o diagnóstico mostrar problemas, execute:

1. **No mesmo SQL Editor**
2. **Copie e cole o arquivo `correcao-radical.sql`**
3. **Clique em "RUN"** e aguarde a execução
4. **Verifique se os resultados mostram sucesso**

### **ETAPA 4: TESTAR CRIAÇÃO DE USUÁRIO**

1. **Vá para Authentication → Users**
2. **Clique em "Add User"**
3. **Preencha os dados:**
   - Email: `teste@valeboi.com`
   - Password: `123456`
   - Auto Confirm User: ✅ Marcado
4. **Clique em "Create user"**

## 🔍 PROBLEMAS MAIS COMUNS

### **1. Extensão uuid-ossp não instalada**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### **2. Tabela user_profiles não existe**
```sql
-- Será criada pela correção radical
```

### **3. Políticas RLS em conflito**
```sql
-- Serão removidas pela correção radical
```

### **4. Trigger não funciona**
```sql
-- Será recriado pela correção radical
```

### **5. Função create_user_profile() com erro**
```sql
-- Será recriada pela correção radical
```

## 🎯 RESULTADO ESPERADO

**Após executar a correção radical:**
- ✅ Tabela `user_profiles` criada sem RLS
- ✅ Função `create_user_profile()` funcionando
- ✅ Trigger `on_auth_user_created` ativo
- ✅ Perfis criados automaticamente para usuários existentes
- ✅ Criação de novos usuários funcionando

## 🔄 SE AINDA DER ERRO

**Execute este comando para verificar logs:**
```sql
SELECT 
    'LOGS' as categoria,
    * 
FROM pg_stat_activity 
WHERE state = 'active' 
   OR query LIKE '%user_profiles%';
```

**Ou tente criar perfil manual:**
```sql
-- Substitua pelo ID real de um usuário existente
INSERT INTO user_profiles (id, name, email, role, active)
SELECT 
    id,
    split_part(email, '@', 1),
    email,
    'vendedor',
    true
FROM auth.users
WHERE email = 'carrocomcafe@gmail.com'
LIMIT 1;
```

## 📞 PRÓXIMOS PASSOS

1. **Execute o diagnóstico** primeiro
2. **Analise os resultados**
3. **Execute a correção radical**
4. **Teste a criação de usuário**
5. **Me avise se funcionou ou se ainda há erros**

## 🛠️ ARQUIVOS NECESSÁRIOS

- `diagnostico-completo.sql` - Para identificar o problema
- `correcao-radical.sql` - Para resolver de vez

**Execute na ordem e me mande os resultados!** 🚀 