-- SOLUÇÃO DIRETA para o usuário separacao@valedoboi.com
-- ID: 867b078f-ce6c-4dcd-bb09-472015615a9d (do log do console)

-- 1. DELETAR PERFIL EXISTENTE (se houver)
DELETE FROM user_profiles WHERE id = '867b078f-ce6c-4dcd-bb09-472015615a9d';

-- 2. INSERIR NOVO PERFIL
INSERT INTO user_profiles (id, role, name, email, active, created_at, updated_at) 
VALUES (
    '867b078f-ce6c-4dcd-bb09-472015615a9d',
    'separacao',
    'Usuário Separação',
    'separacao@valedoboi.com',
    true,
    NOW(),
    NOW()
);

-- 3. VERIFICAR RESULTADO
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    id,
    email,
    role,
    name,
    active
FROM user_profiles 
WHERE id = '867b078f-ce6c-4dcd-bb09-472015615a9d';

-- 4. TESTAR CONSULTA QUE O SISTEMA FAZ
SELECT role, name 
FROM user_profiles 
WHERE id = '867b078f-ce6c-4dcd-bb09-472015615a9d';

-- 5. SE AINDA NÃO FUNCIONAR, VERIFICAR PERMISSÕES
SELECT 
    'PERMISSÕES' as status,
    has_table_privilege('authenticated', 'user_profiles', 'SELECT') as can_select,
    has_table_privilege('authenticated', 'user_profiles', 'INSERT') as can_insert,
    has_table_privilege('authenticated', 'user_profiles', 'UPDATE') as can_update;

-- 6. POLÍTICA SIMPLES (se necessário)
-- DESCOMENTE SE AINDA HOUVER PROBLEMAS:
/*
DROP POLICY IF EXISTS "simple_access" ON user_profiles;
CREATE POLICY "simple_access" ON user_profiles
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);
*/