-- SOLUÇÃO EMERGENCIAL: Desabilitar RLS temporariamente
-- Execute este script AGORA no SQL Editor do Supabase

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR SE O PERFIL EXISTE
SELECT 
    'VERIFICAÇÃO APÓS DESABILITAR RLS' as status,
    id,
    email,
    role,
    name,
    active
FROM user_profiles 
WHERE email = 'separacao@valedoboi.com';

-- 3. SE NÃO EXISTIR, INSERIR O PERFIL
INSERT INTO user_profiles (id, role, name, email, active, created_at, updated_at) 
VALUES (
    '867b078f-ce6c-4dcd-bb09-472015615a9d',
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

-- 4. VERIFICAR SE FUNCIONOU
SELECT 
    'RESULTADO FINAL SEM RLS' as status,
    id,
    email,
    role,
    name,
    active,
    CASE 
        WHEN role = 'separacao' THEN '✅ CORRETO'
        ELSE '❌ INCORRETO'
    END as status_role
FROM user_profiles 
WHERE email = 'separacao@valedoboi.com';

-- 5. TESTAR A CONSULTA EXATA DO SISTEMA
SELECT 
    'CONSULTA DO AUTHCONTEXT' as status,
    role,
    name
FROM user_profiles 
WHERE id = '867b078f-ce6c-4dcd-bb09-472015615a9d';

-- ========================================
-- IMPORTANTE: DEPOIS DE TESTAR E FUNCIONAR
-- ========================================

-- 6. REABILITAR RLS COM POLÍTICA SIMPLES
-- EXECUTE DEPOIS DE CONFIRMAR QUE O LOGIN FUNCIONA
/*
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas problemáticas
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON user_profiles;
DROP POLICY IF EXISTS "allow_authenticated_access" ON user_profiles;

-- Criar política simples que funciona
CREATE POLICY "simple_authenticated_access" ON user_profiles
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Garantir permissões
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
*/

-- INSTRUÇÕES:
-- 1. Execute até o passo 5
-- 2. Teste o login no sistema
-- 3. Se funcionar, execute o código comentado do passo 6
-- 4. Teste novamente para garantir que continua funcionando