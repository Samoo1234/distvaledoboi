-- Script para verificar e corrigir usuário de separação
-- Vale do Boi - Debug Usuario

-- 1. VERIFICAR SE O USUÁRIO EXISTE NO AUTH
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'separacao@valedoboi.com';

-- 2. VERIFICAR SE TEM PERFIL NA TABELA user_profiles
SELECT 
    up.id,
    up.role,
    up.name,
    up.active,
    au.email
FROM user_profiles up
RIGHT JOIN auth.users au ON up.id = au.id
WHERE au.email = 'separacao@valedoboi.com';

-- 3. CRIAR/CORRIGIR O PERFIL (use o ID do usuário encontrado acima)
-- SUBSTITUA 'SEU_ID_AQUI' pelo ID real do usuário

INSERT INTO user_profiles (id, role, name, active, created_at, updated_at) 
VALUES (
    (SELECT id FROM auth.users WHERE email = 'separacao@valedoboi.com'),
    'separacao',
    'João da Separação',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
    role = EXCLUDED.role,
    name = EXCLUDED.name,
    active = EXCLUDED.active,
    updated_at = NOW();

-- 4. VERIFICAR SE FICOU CERTO
SELECT 
    au.email,
    up.role,
    up.name,
    up.active
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'separacao@valedoboi.com'; 