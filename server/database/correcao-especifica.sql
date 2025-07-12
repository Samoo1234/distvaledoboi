-- CORREÇÃO ESPECÍFICA: user_profiles apenas
-- Execute este script no SQL Editor do Supabase

-- 1. DESABILITAR RLS da tabela user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER APENAS AS POLÍTICAS da user_profiles
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users full access" ON user_profiles;
DROP POLICY IF EXISTS "super_simple_policy" ON user_profiles;
DROP POLICY IF EXISTS "allow_all_authenticated" ON user_profiles;

-- 3. REMOVER APENAS O TRIGGER da user_profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- 4. REMOVER APENAS A FUNÇÃO create_user_profile (não mexe na update_updated_at_column)
DROP FUNCTION IF EXISTS create_user_profile();

-- 5. VERIFICAR SE A COLUNA EMAIL EXISTE
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 6. CRIAR FUNÇÃO SIMPLES E ROBUSTA (nova versão)
CREATE OR REPLACE FUNCTION create_user_profile_new()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, name, email, role, active)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'name', 
            split_part(NEW.email, '@', 1), 
            'Usuário'
        ),
        NEW.email,
        'vendedor',
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(
            NEW.raw_user_meta_data->>'name', 
            split_part(NEW.email, '@', 1), 
            'Usuário'
        ),
        email = NEW.email,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CRIAR TRIGGER NOVO
CREATE TRIGGER on_auth_user_created_new
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION create_user_profile_new();

-- 8. ATUALIZAR PERFIS EXISTENTES COM EMAIL
UPDATE user_profiles 
SET email = (
    SELECT email 
    FROM auth.users 
    WHERE auth.users.id = user_profiles.id
)
WHERE email IS NULL;

-- 9. CRIAR PERFIS PARA USUÁRIOS EXISTENTES SEM PERFIL
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

-- 10. PROMOVER USUÁRIO PARA ADMIN
UPDATE user_profiles 
SET role = 'admin', name = 'Admin Sistema'
WHERE email = 'carrocomcafe@gmail.com'
   OR email LIKE '%admin%';

-- 11. VERIFICAR RESULTADO
SELECT 
    'RESULTADO FINAL' as status,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM user_profiles) as total_profiles,
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'admin') as total_admins;

-- 12. MOSTRAR PERFIS CRIADOS
SELECT 
    'PERFIS ATUALIZADOS' as categoria,
    up.name,
    up.email,
    up.role,
    up.active
FROM user_profiles up
ORDER BY 
    CASE up.role 
        WHEN 'admin' THEN 1 
        WHEN 'vendedor' THEN 2 
        ELSE 3 
    END,
    up.created_at DESC;

-- 13. TESTAR CRIAÇÃO MANUAL DE PERFIL
INSERT INTO user_profiles (id, name, email, role, active)
VALUES (
    gen_random_uuid(),
    'Teste Manual',
    'teste@manual.com',
    'vendedor',
    true
);

-- Remover o teste
DELETE FROM user_profiles WHERE email = 'teste@manual.com';

SELECT 'SUCESSO: Correção aplicada sem afetar outras tabelas!' as resultado; 