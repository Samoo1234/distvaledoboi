-- Verificar se o usuário samtecsolucoes@gmail.com tem perfil
-- Execute no SQL Editor do Supabase

-- 1. Mostrar dados do usuário no auth.users
SELECT 
    'USUÁRIO EM AUTH.USERS' as status,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'samtecsolucoes@gmail.com';

-- 2. Verificar se existe perfil para este usuário
SELECT 
    'PERFIL EXISTENTE' as status,
    p.id,
    p.role,
    p.name,
    p.active,
    u.email
FROM user_profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'samtecsolucoes@gmail.com';

-- 3. Se não encontrar perfil acima, mostrar isso
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'USUÁRIO SEM PERFIL - PRECISA CRIAR'
        ELSE 'USUÁRIO COM PERFIL - OK'
    END as diagnostico
FROM user_profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'samtecsolucoes@gmail.com'; 