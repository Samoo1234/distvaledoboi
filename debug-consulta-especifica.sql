-- Debug: Testar a consulta EXATA que o sistema está fazendo
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR SE O USUÁRIO EXISTE NO AUTH
SELECT 
    'USUÁRIO NO AUTH' as status,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'separacao@valedoboi.com';

-- 2. TESTAR A CONSULTA EXATA DO SISTEMA
-- Esta é a consulta que o AuthContext.tsx está fazendo
SELECT 
    'CONSULTA DO SISTEMA' as status,
    role, 
    name
FROM user_profiles 
WHERE id = '867b078f-ce6c-4dcd-bb09-472015615a9d';

-- 3. VERIFICAR TODAS AS POLÍTICAS RLS
SELECT 
    'POLÍTICAS ATIVAS' as status,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. VERIFICAR PERMISSÕES DA ROLE AUTHENTICATED
SELECT 
    'PERMISSÕES AUTHENTICATED' as status,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'user_profiles' 
AND grantee = 'authenticated';

-- 5. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
    'STATUS RLS' as status,
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 6. TESTAR ACESSO DIRETO COMO AUTHENTICATED
-- Simular o que acontece quando o sistema tenta acessar
SET ROLE authenticated;
SELECT 
    'TESTE COMO AUTHENTICATED' as status,
    role, 
    name
FROM user_profiles 
WHERE id = '867b078f-ce6c-4dcd-bb09-472015615a9d';
RESET ROLE;

-- 7. SOLUÇÃO EMERGENCIAL - DESABILITAR RLS TEMPORARIAMENTE
-- DESCOMENTE APENAS SE NECESSÁRIO PARA TESTE URGENTE
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 8. DEPOIS DE TESTAR, REABILITAR COM POLÍTICA SIMPLES
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "allow_authenticated_access" ON user_profiles;
-- CREATE POLICY "allow_authenticated_access" ON user_profiles
--     FOR ALL TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- 9. VERIFICAR RESULTADO FINAL
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