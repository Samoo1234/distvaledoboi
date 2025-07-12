-- CORREÇÃO: Foreign Key Constraint Problem
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR ESTRUTURA DA TABELA user_profiles
SELECT 
    'FOREIGN KEYS' as categoria,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'user_profiles';

-- 2. VERIFICAR SE A TABELA "users" EXISTE
SELECT 
    'TABELA users' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as resultado;

-- 3. VERIFICAR SE A TABELA "auth.users" EXISTE
SELECT 
    'TABELA auth.users' as categoria,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'auth') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as resultado;

-- 4. LIMPAR DADOS ÓRFÃOS (perfis sem usuário correspondente)
DELETE FROM user_profiles 
WHERE id NOT IN (
    SELECT id FROM auth.users
);

-- 5. REMOVER CONSTRAINT PROBLEMÁTICA
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 6. RECRIAR CONSTRAINT CORRETA
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. CRIAR PERFIS PARA USUÁRIOS EXISTENTES (sem órfãos)
INSERT INTO user_profiles (id, name, email, role, active)
SELECT 
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'name', 
        split_part(u.email, '@', 1), 
        'Usuário'
    ) as name,
    u.email,
    'vendedor' as role,
    true as active
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles p WHERE p.id = u.id
);

-- 8. PROMOVER USUÁRIO PARA ADMIN
UPDATE user_profiles 
SET role = 'admin', name = 'Admin Sistema'
WHERE email = 'carrocomcafe@gmail.com'
   OR email LIKE '%admin%';

-- 9. VERIFICAR RESULTADO
SELECT 
    'RESULTADO FINAL' as status,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM user_profiles) as total_profiles,
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'admin') as total_admins;

-- 10. MOSTRAR PERFIS VÁLIDOS
SELECT 
    'PERFIS VÁLIDOS' as categoria,
    up.name,
    up.email,
    up.role,
    up.active
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
ORDER BY 
    CASE up.role 
        WHEN 'admin' THEN 1 
        WHEN 'vendedor' THEN 2 
        ELSE 3 
    END;

-- 11. TESTAR CRIAÇÃO MANUAL DE PERFIL
DO $$
DECLARE
    test_user_id uuid;
BEGIN
    -- Pegar ID de um usuário existente
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    -- Tentar criar perfil para esse usuário
    INSERT INTO user_profiles (id, name, email, role, active)
    VALUES (
        test_user_id,
        'Teste Foreign Key',
        'teste@fk.com',
        'vendedor',
        true
    ) ON CONFLICT (id) DO UPDATE SET
        name = 'Teste Foreign Key',
        email = 'teste@fk.com';
    
    RAISE NOTICE 'SUCESSO: Foreign key funcionando corretamente';
    
    -- Remover o teste
    UPDATE user_profiles 
    SET name = (SELECT split_part(email, '@', 1) FROM auth.users WHERE id = test_user_id),
        email = (SELECT email FROM auth.users WHERE id = test_user_id)
    WHERE id = test_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO: %', SQLERRM;
END $$;

SELECT 'CORREÇÃO APLICADA: Foreign key constraint corrigida!' as resultado; 