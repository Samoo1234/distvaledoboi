-- CORREÇÃO: Criar perfis para usuários existentes no auth.users
-- Execute este script no SQL Editor do Supabase

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode criar seu perfil inicial" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil, administradores podem atualizar qualquer perfil" ON user_profiles;
DROP POLICY IF EXISTS "Apenas administradores podem deletar perfis" ON user_profiles;
DROP POLICY IF EXISTS "Apenas administradores podem inserir perfis" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON user_profiles;

-- 3. VERIFICAR ESTRUTURA DA TABELA E AJUSTAR SE NECESSÁRIO
-- Adicionar coluna email se não existir
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 4. CRIAR PERFIS PARA USUÁRIOS EXISTENTES DO AUTH.USERS
-- Isso vai pegar todos os usuários do auth.users e criar perfis para eles
INSERT INTO user_profiles (id, name, email, role, active)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', SPLIT_PART(au.email, '@', 1), 'Usuário') as name,
    au.email,
    'vendedor' as role,  -- Perfil padrão para usuários existentes
    true as active
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL  -- Só insere se não existir perfil ainda
AND au.email IS NOT NULL;

-- 5. DEFINIR UM USUÁRIO COMO ADMIN (baseado no email)
-- SUBSTITUA 'seu-email@gmail.com' pelo email do usuário que deve ser admin
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'administrador@valeboi.com' 
   OR email = 'admin@valeboi.com'
   OR email LIKE '%admin%';

-- 6. RECRIAR POLÍTICAS SIMPLES SEM RECURSÃO
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política simples: usuários autenticados podem fazer tudo
CREATE POLICY "authenticated_users_full_access" 
ON user_profiles FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- 7. VERIFICAR RESULTADO
SELECT 'PERFIS CRIADOS PARA USUÁRIOS EXISTENTES' as status;
SELECT 
    up.id,
    up.name,
    up.email,
    up.role,
    up.active,
    'Usuário do auth.users' as origem
FROM user_profiles up
ORDER BY up.created_at DESC; 