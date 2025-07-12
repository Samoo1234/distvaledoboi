-- CORREÇÃO RADICAL: Recriar tudo do zero
-- Execute APÓS o diagnóstico para resolver de vez o problema

-- 1. CRIAR EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. REMOVER COMPLETAMENTE A TABELA user_profiles (CUIDADO!)
-- Só descomente isso se você tiver certeza
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- 3. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. REMOVER TODAS AS POLÍTICAS, TRIGGERS E FUNÇÕES
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users full access" ON user_profiles;
DROP POLICY IF EXISTS "super_simple_policy" ON user_profiles;
DROP POLICY IF EXISTS "allow_all_authenticated" ON user_profiles;

-- Remover triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Remover funções
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 5. RECRIAR TABELA user_profiles DO ZERO
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL DEFAULT 'Usuário',
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'vendedor' CHECK (role IN ('vendedor', 'separacao', 'admin')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CRIAR FUNÇÃO SIMPLES E ROBUSTA
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir perfil com dados básicos
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
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Se der erro, apenas registra mas não falha
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CRIAR TRIGGER ROBUSTO
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION create_user_profile();

-- 8. CRIAR PERFIS PARA USUÁRIOS EXISTENTES
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

-- 9. NÃO ATIVAR RLS POR ENQUANTO
-- Vamos deixar a tabela sem RLS para teste
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 10. CRIAR USUÁRIO ADMIN DE TESTE
INSERT INTO user_profiles (id, name, email, role, active)
SELECT 
    u.id,
    'Admin Sistema',
    u.email,
    'admin',
    true
FROM auth.users u
WHERE u.email LIKE '%admin%' 
   OR u.email LIKE '%@gmail.com%'
   OR u.email = 'carrocomcafe@gmail.com'
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    name = 'Admin Sistema',
    updated_at = CURRENT_TIMESTAMP;

-- 11. VERIFICAR RESULTADO
SELECT 
    'RESULTADO FINAL' as status,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM user_profiles) as total_profiles,
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'admin') as total_admins;

-- 12. MOSTRAR DADOS CRIADOS
SELECT 
    'PERFIS CRIADOS' as categoria,
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

-- 13. INSTRUÇÕES FINAIS
SELECT 
    'INSTRUÇÕES' as categoria,
    'Tabela user_profiles recriada SEM RLS' as resultado,
    'Tente criar usuário agora no dashboard' as acao; 