-- SOLUÇÃO EXTREMA: Desabilitar tudo que pode estar causando problema
-- Execute este script no SQL Editor do Supabase

-- 1. DESABILITAR COMPLETAMENTE TODOS OS TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_new ON auth.users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- 2. REMOVER TODAS AS FUNÇÕES RELACIONADAS A PERFIS
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS create_user_profile_new() CASCADE;

-- 3. DESABILITAR RLS COMPLETAMENTE
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 4. REMOVER TODAS AS CONSTRAINTS FOREIGN KEY
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- 5. RECRIAR TABELA user_profiles SIMPLES (sem foreign key)
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Usuário',
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'vendedor',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CRIAR PERFIS MANUALMENTE PARA USUÁRIOS EXISTENTES
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
FROM auth.users u;

-- 7. PROMOVER USUÁRIO PARA ADMIN
UPDATE user_profiles 
SET role = 'admin', name = 'Admin Sistema'
WHERE email = 'carrocomcafe@gmail.com';

-- 8. VERIFICAR RESULTADO
SELECT 
    'RESULTADO' as status,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM user_profiles) as total_profiles;

-- 9. MOSTRAR PERFIS CRIADOS
SELECT 
    'PERFIS CRIADOS' as categoria,
    up.name,
    up.email,
    up.role,
    up.active
FROM user_profiles up
ORDER BY up.role;

-- 10. TESTE FINAL: CRIAR PERFIL MANUALMENTE
INSERT INTO user_profiles (id, name, email, role, active)
VALUES (
    gen_random_uuid(),
    'Teste Final',
    'teste@final.com',
    'vendedor',
    true
);

-- Remover teste
DELETE FROM user_profiles WHERE email = 'teste@final.com';

SELECT 'SUCESSO: Tabela user_profiles recriada SEM triggers, RLS ou constraints!' as resultado;
SELECT 'INSTRUÇÃO: Agora tente criar usuário no dashboard' as instrucao;
SELECT 'ATENÇÃO: Os perfis NÃO serão criados automaticamente' as aviso;
SELECT 'SOLUÇÃO: Você precisará criar perfis manualmente via SQL' as solucao; 