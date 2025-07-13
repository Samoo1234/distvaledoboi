-- Script para corrigir roles dos usuários específicos
-- Vale do Boi - Correção de Perfis

-- 1. VERIFICAR USUÁRIOS EXISTENTES
SELECT 
    'USUÁRIOS EXISTENTES' as status,
    au.id,
    au.email,
    au.email_confirmed_at,
    up.role,
    up.name,
    up.active
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email IN ('separacao@valedoboi.com', 'carrocomcafe@gmail.com')
ORDER BY au.email;

-- 2. INSERIR/ATUALIZAR PERFIL PARA SEPARAÇÃO
INSERT INTO user_profiles (id, role, name, email, active, created_at, updated_at) 
VALUES (
    (SELECT id FROM auth.users WHERE email = 'separacao@valedoboi.com'),
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

-- 3. INSERIR/ATUALIZAR PERFIL PARA ADMIN
INSERT INTO user_profiles (id, role, name, email, active, created_at, updated_at) 
VALUES (
    (SELECT id FROM auth.users WHERE email = 'carrocomcafe@gmail.com'),
    'admin',
    'Administrador Sistema',
    'carrocomcafe@gmail.com',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
    role = 'admin',
    name = 'Administrador Sistema',
    email = 'carrocomcafe@gmail.com',
    active = true,
    updated_at = NOW();

-- 4. VERIFICAR RESULTADO FINAL
SELECT 
    'RESULTADO FINAL' as status,
    au.email,
    up.role,
    up.name,
    up.active,
    CASE 
        WHEN up.role = 'separacao' AND au.email = 'separacao@valedoboi.com' THEN '✅ CORRETO'
        WHEN up.role = 'admin' AND au.email = 'carrocomcafe@gmail.com' THEN '✅ CORRETO'
        ELSE '❌ INCORRETO'
    END as status_role
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email IN ('separacao@valedoboi.com', 'carrocomcafe@gmail.com')
ORDER BY au.email;

-- 5. VERIFICAR TODOS OS PERFIS (OPCIONAL)
SELECT 
    'TODOS OS PERFIS' as status,
    au.email,
    up.role,
    up.name,
    up.active
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
ORDER BY up.role, au.email;