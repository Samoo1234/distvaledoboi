# 🚨 RESOLVER ERRO "User not allowed" do Supabase

## 🔍 Diagnóstico do Problema

O erro **"User not allowed"** acontece quando:

1. **Registro está desabilitado** no Supabase
2. **Políticas RLS muito restritivas** impedem criação de usuários
3. **Configurações de segurança** estão bloqueando novos registros
4. **Problema com service_role** para criação de usuários admin

## 🛠️ Solução Completa

### **ETAPA 1: Verificar Configurações do Supabase**

1. **Vá para o Supabase Dashboard**
2. **Authentication → Settings**
3. **Verifique as configurações:**
   - ✅ **Enable signup**: DEVE estar habilitado
   - ✅ **Enable email confirmations**: Pode estar desabilitado para testes
   - ✅ **Enable phone confirmations**: Pode estar desabilitado

### **ETAPA 2: Executar Script SQL de Correção**

Execute o script `resolver-user-not-allowed.sql` no SQL Editor:

```sql
-- RESOLVER PROBLEMA "User not allowed" 
-- Execute este script no SQL Editor do Supabase

-- 1. PRIMEIRO: Verificar se existem usuários no sistema
SELECT 
    'DIAGNÓSTICO: Usuários existentes' as status,
    COUNT(*) as total_usuarios
FROM auth.users;

-- 2. VERIFICAR se user_profiles existe e está funcionando
SELECT 
    'DIAGNÓSTICO: Perfis existentes' as status,
    COUNT(*) as total_perfis
FROM user_profiles;

-- 3. DESABILITAR TEMPORARIAMENTE TODAS AS POLÍTICAS RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users full access" ON user_profiles;

-- 5. CRIAR FUNÇÃO PARA CRIAR PERFIS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, role, name, active)
    VALUES (
        NEW.id,
        'vendedor',
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR TRIGGER PARA EXECUTAR AUTOMATICAMENTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 7. CRIAR PERFIS PARA USUÁRIOS EXISTENTES QUE NÃO TÊM PERFIL
INSERT INTO user_profiles (id, role, name, active)
SELECT 
    u.id,
    'vendedor' as role,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Usuário') as name,
    true as active
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 8. REABILITAR RLS COM POLÍTICAS SIMPLES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política SUPER simples - permite tudo para usuários autenticados
CREATE POLICY "super_simple_policy" 
ON user_profiles FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- 9. VERIFICAR SE RESOLVEU
SELECT 
    'RESULTADO: Perfis criados' as status,
    COUNT(*) as total
FROM user_profiles;

-- 10. TESTAR ACESSO
SELECT 
    'TESTE: Dados dos perfis' as status,
    id,
    role,
    name,
    active
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;
```

### **ETAPA 3: Testar Criação de Usuário**

Após executar o script, teste:

1. **Vá para Authentication → Users**
2. **Clique em "Add User"**
3. **Crie um usuário de teste:**
   - Email: `teste@valeboi.com`
   - Password: `123456`
   - Email Confirm: `true`

### **ETAPA 4: Verificar se Funcionou**

Execute no SQL Editor:

```sql
-- Verificar se o usuário foi criado com perfil
SELECT 
    au.email,
    up.role,
    up.name,
    up.active
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'teste@valeboi.com';
```

## 🔧 Configurações Adicionais

### **Para Permitir Registro Público (Opcional)**

Se quiser permitir que usuários se registrem pelo sistema:

1. **Authentication → Settings**
2. **Enable signup**: ✅ Habilitado
3. **Enable email confirmations**: ❌ Desabilitado (para testes)

### **Para Criar Usuários Admin**

```sql
-- Promover um usuário existente para admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'ID_DO_USUARIO_AQUI';
```

## 🚨 Problemas Comuns e Soluções

### **1. Ainda dá erro "User not allowed"**
- Verifique se o **Enable signup** está habilitado
- Tente desabilitar **Email confirmations** temporariamente

### **2. Usuário criado mas não aparece no sistema**
- Execute o script SQL novamente
- Verifique se o trigger está funcionando

### **3. Perfil não é criado automaticamente**
- Verifique se a função `create_user_profile()` existe
- Verifique se o trigger `on_auth_user_created` está ativo

### **4. Erro de permissão ao criar usuário**
- Certifique-se de que está usando um usuário admin
- Verifique se as políticas RLS não estão muito restritivas

## ✅ Checklist de Verificação

- [ ] **Enable signup** habilitado no Supabase
- [ ] Script SQL executado com sucesso
- [ ] Tabela `user_profiles` criada
- [ ] Trigger `on_auth_user_created` funcionando
- [ ] Política RLS `super_simple_policy` criada
- [ ] Usuário de teste criado com sucesso
- [ ] Perfil criado automaticamente para o usuário

## 🎯 Resultado Esperado

Depois de seguir todos os passos:
- ✅ Usuários podem ser criados sem erro
- ✅ Perfis são criados automaticamente
- ✅ Login funciona normalmente
- ✅ Sistema não apresenta erros RLS

## 🔄 Próximos Passos

1. **Testar login** com usuário criado
2. **Verificar interfaces** mobile/desktop
3. **Promover usuário para admin** se necessário
4. **Testar funcionalidades** do sistema 