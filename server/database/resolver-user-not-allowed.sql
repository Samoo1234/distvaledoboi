-- RESOLVER PROBLEMA "User not allowed" 
-- Execute este script no SQL Editor do Supabase

-- 1. PRIMEIRO: Verificar se existem usuários no sistema
SELECT 
    'DIAGNÓSTICO: Usuários existentes' as status,
    COUNT(*) as total_usuarios
FROM auth.users;

-- 2. VERIFICAR se user_profiles existe e está funcionando
SELECT 
    'DIAGNÓSTICO: Perfis existentes' as status,
    COUNT(*) as total_perfis
FROM user_profiles;

-- 3. DESABILITAR TEMPORARIAMENTE TODAS AS POLÍTICAS RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users full access" ON user_profiles;

-- 5. CRIAR FUNÇÃO PARA CRIAR PERFIS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, role, name, active)
    VALUES (
        NEW.id,
        'vendedor',
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        true
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR TRIGGER PARA EXECUTAR AUTOMATICAMENTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 7. CRIAR PERFIS PARA USUÁRIOS EXISTENTES QUE NÃO TÊM PERFIL
INSERT INTO user_profiles (id, role, name, active)
SELECT 
    u.id,
    'vendedor' as role,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Usuário') as name,
    true as active
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 8. REABILITAR RLS COM POLÍTICAS SIMPLES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política SUPER simples - permite tudo para usuários autenticados
CREATE POLICY "super_simple_policy" 
ON user_profiles FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- 9. VERIFICAR SE RESOLVEU
SELECT 
    'RESULTADO: Perfis criados' as status,
    COUNT(*) as total
FROM user_profiles;

-- 10. TESTAR ACESSO
SELECT 
    'TESTE: Dados dos perfis' as status,
    id,
    role,
    name,
    active
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5; 