-- CORREÇÃO DAS POLÍTICAS RLS PARA user_profiles
-- O perfil existe mas o sistema não consegue acessá-lo

-- 1. VERIFICAR POLÍTICAS ATUAIS
SELECT 
    'POLÍTICAS ATUAIS' as status,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON user_profiles;
DROP POLICY IF EXISTS "simple_access" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users full access" ON user_profiles;
DROP POLICY IF EXISTS "super_simple_policy" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for service_role only" ON user_profiles;

-- 3. CRIAR POLÍTICA SIMPLES E FUNCIONAL
CREATE POLICY "allow_authenticated_access" ON user_profiles
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. VERIFICAR SE A POLÍTICA FOI CRIADA
SELECT 
    'NOVA POLÍTICA' as status,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 5. TESTAR ACESSO DIRETO
SELECT 
    'TESTE ACESSO' as status,
    id,
    email,
    role,
    name,
    active
FROM user_profiles 
WHERE email = 'separacao@valedoboi.com';

-- 6. TESTAR A CONSULTA EXATA QUE O SISTEMA FAZ
SELECT 
    'TESTE SISTEMA' as status,
    role,
    name
FROM user_profiles 
WHERE id = '867b078f-ce6c-4dcd-bb09-472015615a9d';

-- 7. SE AINDA NÃO FUNCIONAR, DESABILITAR RLS TEMPORARIAMENTE
-- DESCOMENTE APENAS SE NECESSÁRIO:
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 8. VERIFICAR PERMISSÕES DA ROLE AUTHENTICATED
SELECT 
    'PERMISSÕES' as status,
    has_table_privilege('authenticated', 'user_profiles', 'SELECT') as can_select,
    has_table_privilege('authenticated', 'user_profiles', 'INSERT') as can_insert,
    has_table_privilege('authenticated', 'user_profiles', 'UPDATE') as can_update;

-- 9. GRANT EXPLÍCITO SE NECESSÁRIO
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;