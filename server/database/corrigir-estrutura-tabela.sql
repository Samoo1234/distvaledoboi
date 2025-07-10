-- Corrigir estrutura da tabela user_profiles
-- Execute no SQL Editor do Supabase

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Adicionar coluna 'active' se não existir
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- 3. Verificar estrutura após adicionar coluna
SELECT 'ESTRUTURA CORRIGIDA' as status;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 4. Verificar usuário específico (SEM a coluna active por enquanto)
SELECT 
    'USUÁRIO EM AUTH.USERS' as status,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'samtecsolucoes@gmail.com';

-- 5. Verificar se existe perfil para este usuário (SEM active)
SELECT 
    'PERFIL EXISTENTE' as status,
    p.id,
    p.role,
    p.name,
    u.email
FROM user_profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'samtecsolucoes@gmail.com'; 