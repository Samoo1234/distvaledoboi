-- Script URGENTE para corrigir usuário separacao@valedoboi.com
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR SE O USUÁRIO EXISTE
SELECT 
    'VERIFICAÇÃO INICIAL' as status,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'separacao@valedoboi.com';

-- 2. VERIFICAR SE JÁ TEM PERFIL
SELECT 
    'PERFIL ATUAL' as status,
    up.id,
    up.email,
    up.role,
    up.name,
    up.active
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'separacao@valedoboi.com';

-- 3. INSERIR/ATUALIZAR PERFIL PARA SEPARAÇÃO
-- Use o ID real do usuário que apareceu na consulta acima
INSERT INTO user_profiles (id, role, name, email, active, created_at, updated_at) 
VALUES (
    '867b078f-ce6c-4dcd-bb09-472015615a9d', -- ID do usuário separacao@valedoboi.com
    'separacao',
    'Usuário Separação',
    'separacao@valedoboi.com',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
    role = 'separacao',
    name = 'Usuário Separação',
    email = 'separacao@valedoboi.com',
    active = true,
    updated_at = NOW();

-- 4. VERIFICAR SE FUNCIONOU
SELECT 
    'RESULTADO FINAL' as status,
    au.email,
    up.role,
    up.name,
    up.active,
    CASE 
        WHEN up.role = 'separacao' THEN '✅ CORRETO'
        ELSE '❌ INCORRETO'
    END as status_role
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'separacao@valedoboi.com';

-- 5. VERIFICAR POLÍTICAS RLS (se ainda houver problema)
SELECT 
    'POLÍTICAS RLS' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 6. SE AINDA NÃO FUNCIONAR, DESABILITAR RLS TEMPORARIAMENTE
-- DESCOMENTE AS LINHAS ABAIXO APENAS SE NECESSÁRIO
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- DEPOIS DE TESTAR, REABILITE:
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;