-- Script para diagnosticar usuários sem perfil
-- Execute no SQL Editor do Supabase

-- 1. Verificar usuários em auth.users
SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users;

-- 2. Verificar usuários em user_profiles  
SELECT 'user_profiles' as tabela, COUNT(*) as total FROM user_profiles;

-- 3. Mostrar usuários que existem em auth.users mas NÃO em user_profiles
SELECT 
    u.id,
    u.email,
    u.created_at,
    'SEM PERFIL' as status
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 4. Mostrar perfis existentes
SELECT 
    p.id,
    p.role,
    p.name,
    p.active,
    u.email
FROM user_profiles p
JOIN auth.users u ON p.id = u.id; 