-- CORREÇÃO: Database error creating new user
-- Execute este script COMPLETO no SQL Editor do Supabase

-- 1. VERIFICAR SE A TABELA user_profiles EXISTE
SELECT 
    'VERIFICAÇÃO: Tabela user_profiles' as status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') 
        THEN 'EXISTE' 
        ELSE 'NÃO EXISTE' 
    END as resultado;

-- 2. CRIAR TABELA user_profiles SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Usuário',
    role VARCHAR(20) NOT NULL DEFAULT 'vendedor' CHECK (role IN ('vendedor', 'separacao', 'admin')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ADICIONAR COLUNA EMAIL SE NÃO EXISTIR (pode ser necessária)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 4. REMOVER TODAS AS POLÍTICAS RLS PROBLEMÁTICAS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users full access" ON user_profiles;
DROP POLICY IF EXISTS "super_simple_policy" ON user_profiles;

-- 5. CRIAR FUNÇÃO PARA CRIAR PERFIS AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, name, role, active, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Usuário'),
        'vendedor',
        true,
        NEW.email
    )
    ON CONFLICT (id) DO UPDATE SET
        name = COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Usuário'),
        email = NEW.email,
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CRIAR TRIGGER PARA EXECUTAR AUTOMATICAMENTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 7. CRIAR PERFIS PARA USUÁRIOS EXISTENTES
INSERT INTO user_profiles (id, name, role, active, email)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Usuário') as name,
    'vendedor' as role,
    true as active,
    u.email
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = CURRENT_TIMESTAMP;

-- 8. REABILITAR RLS COM POLÍTICA SUPER SIMPLES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política que permite TUDO para usuários autenticados
CREATE POLICY "allow_all_authenticated" 
ON user_profiles FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- 9. VERIFICAR SE RESOLVEU
SELECT 
    'RESULTADO: Usuários e perfis' as status,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM user_profiles) as total_profiles;

-- 10. MOSTRAR DADOS PARA VERIFICAÇÃO
SELECT 
    'DADOS: Perfis criados' as status,
    up.id,
    up.name,
    up.role,
    up.active,
    up.email
FROM user_profiles up
ORDER BY up.created_at DESC
LIMIT 3;

-- 11. TESTAR CRIAÇÃO DE PERFIL MANUAL (para debug)
SELECT 'TESTE: Função create_user_profile disponível' as status,
       'Execute novamente a criação do usuário no dashboard' as instrucao; 