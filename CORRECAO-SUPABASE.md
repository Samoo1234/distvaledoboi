# 🔧 Correção do Problema no Supabase

## 🚨 Problemas Identificados

### **Erro 1: `42601: somente expressão WITH CHECK permitida para INSERT`**
As políticas RLS (Row Level Security) estavam usando `USING` para operações de `INSERT`, quando o correto é usar `WITH CHECK`.

### **Erro 2: `42P10: não há restrição exclusiva ou de exclusão que corresponda à especificação ON CONFLICT`**
O comando `ON CONFLICT (sku)` falha porque o campo `sku` não tinha constraint UNIQUE definida.

## ✅ Solução

### **Passo 1: Limpar o Banco Atual (Se Necessário)**

Se você já tentou executar o schema anterior e teve erros, execute estes comandos no SQL Editor do Supabase para limpar:

```sql
-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Produtos visíveis para todos os usuários autenticados" ON products;
DROP POLICY IF EXISTS "Apenas administradores podem inserir produtos" ON products;
DROP POLICY IF EXISTS "Apenas administradores podem atualizar produtos" ON products;
DROP POLICY IF EXISTS "Apenas administradores podem deletar produtos" ON products;

DROP POLICY IF EXISTS "Vendedores veem apenas seus clientes" ON customers;
DROP POLICY IF EXISTS "Vendedores e administradores podem inserir clientes" ON customers;
DROP POLICY IF EXISTS "Vendedores atualizam apenas seus clientes, admins atualizam qualquer cliente" ON customers;
DROP POLICY IF EXISTS "Apenas administradores podem deletar clientes" ON customers;

DROP POLICY IF EXISTS "Vendedores veem apenas seus pedidos" ON orders;
DROP POLICY IF EXISTS "Vendedores e administradores podem inserir pedidos" ON orders;
DROP POLICY IF EXISTS "Vendedores atualizam apenas seus pedidos, admin/separacao podem atualizar qualquer pedido" ON orders;
DROP POLICY IF EXISTS "Apenas administradores podem deletar pedidos" ON orders;

DROP POLICY IF EXISTS "Qualquer usuário autenticado pode ver itens do pedido" ON order_items;
DROP POLICY IF EXISTS "Vendedores e administradores podem inserir itens do pedido" ON order_items;
DROP POLICY IF EXISTS "Vendedores e administradores podem atualizar itens do pedido" ON order_items;
DROP POLICY IF EXISTS "Apenas administradores podem deletar itens do pedido" ON order_items;

DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Apenas administradores podem criar perfis" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil, administradores podem atualizar qualquer perfil" ON user_profiles;

-- Se as tabelas já existem, não é necessário dropa-las
```

### **Passo 2: Executar o Schema Final Corrigido**

1. **Vá para o Supabase Dashboard**
2. **Abra o SQL Editor**
3. **Copie todo o conteúdo do arquivo `schema-final.sql`**
4. **Cole no SQL Editor**
5. **Execute o script (botão "RUN")**

> **⚠️ IMPORTANTE**: Use o arquivo `schema-final.sql` que resolve TODOS os problemas identificados!

### **Passo 3: Criar Usuário Administrador**

Após executar o schema, você precisa criar um usuário administrador:

1. **Vá para Authentication > Users**
2. **Clique em "Add user"**
3. **Crie um usuário (ex: admin@valedeboi.com)**
4. **Copie o UUID do usuário criado**
5. **Execute no SQL Editor:**

```sql
-- Substitua 'SEU-UUID-AQUI' pelo UUID real do usuário
INSERT INTO user_profiles (id, role, name, active) 
VALUES ('SEU-UUID-AQUI', 'admin', 'Administrador do Sistema', true)
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin', 
    name = 'Administrador do Sistema',
    active = true;
```

### **Passo 4: Verificar se Funcionou**

Execute este comando para verificar se tudo está funcionando:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'customers', 'orders', 'order_items', 'user_profiles');

-- Verificar se há produtos de exemplo
SELECT name, price, category FROM products LIMIT 5;

-- Verificar se o usuário admin foi criado
SELECT id, role, name FROM user_profiles WHERE role = 'admin';
```

## 🔄 Principais Correções Feitas

### **1. Políticas INSERT**
```sql
-- ❌ ANTES (Incorreto)
CREATE POLICY "policy_name" ON table_name FOR INSERT
USING (condition);

-- ✅ AGORA (Correto)  
CREATE POLICY "policy_name" ON table_name FOR INSERT
WITH CHECK (condition);
```

### **2. Políticas UPDATE**
```sql
-- ✅ CORRETO (Ambas as cláusulas)
CREATE POLICY "policy_name" ON table_name FOR UPDATE
USING (condition_for_existing_rows)
WITH CHECK (condition_for_new_values);
```

### **3. Política de user_profiles Mais Flexível**
```sql
-- Agora qualquer usuário pode criar seu próprio perfil
CREATE POLICY "Qualquer usuário autenticado pode criar seu perfil inicial"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());
```

### **4. Campo SKU com Constraint UNIQUE**
```sql
-- ✅ ADICIONADO UNIQUE para permitir ON CONFLICT
sku VARCHAR(50) UNIQUE,
```

### **5. INSERT sem ON CONFLICT (Método mais seguro)**
```sql
-- ❌ ANTES (Causava erro)
INSERT INTO products (...) VALUES (...)
ON CONFLICT (sku) DO NOTHING;

-- ✅ AGORA (Mais seguro)
INSERT INTO products (name, description, price, stock, category, sku) 
SELECT 'Alcatra', 'Corte bovino...', 28.90, 50.0, 'Bovino', 'BOV-ALC-001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'BOV-ALC-001');
```

## 📦 Dados de Exemplo Inclusos

O schema corrigido já inclui alguns produtos de exemplo:
- Alcatra (R$ 28,90)
- Picanha (R$ 45,90) 
- Fraldinha (R$ 32,90)
- Costela (R$ 18,90)
- Linguiça Calabresa (R$ 15,90)
- Bacon Fatiado (R$ 24,90)

## 🚀 Próximos Passos

Após executar o schema corrigido com sucesso:

1. ✅ **Teste o login** no sistema
2. ✅ **Verifique se as interfaces** mobile/desktop estão funcionando
3. ✅ **Teste a criação** de clientes e pedidos
4. ✅ **Continue para a Fase 2** do desenvolvimento

## 📞 Em Caso de Problemas

Se ainda houver erros:

1. **Copie a mensagem de erro exata**
2. **Verifique se executou todo o schema-corrigido.sql**
3. **Confirme se o usuário admin foi criado corretamente**
4. **Teste com um usuário simples primeiro**

O schema final (`schema-final.sql`) resolve completamente TODOS os problemas identificados no Supabase! 