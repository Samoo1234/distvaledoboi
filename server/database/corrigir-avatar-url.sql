-- CORREÇÃO: Adicionar coluna avatar_url que está faltando
-- Execute este script no SQL Editor do Supabase

-- 1. ADICIONAR COLUNA AVATAR_URL
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    'COLUNAS user_profiles' as categoria,
    column_name as nome,
    data_type as tipo
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 3. CRIAR PERFIL ADMIN COMPLETO
INSERT INTO user_profiles (id, name, email, role, active, avatar_url)
SELECT 
    id,
    'Admin Sistema',
    email,
    'admin',
    true,
    NULL
FROM auth.users 
WHERE email = 'carrocomcafe@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    name = 'Admin Sistema',
    role = 'admin',
    active = true,
    avatar_url = NULL;

-- 4. VERIFICAR PERFIL CRIADO
SELECT 
    'PERFIL ADMIN' as status,
    up.id,
    up.name,
    up.email,
    up.role,
    up.active,
    up.avatar_url
FROM user_profiles up
WHERE up.email = 'carrocomcafe@gmail.com';

-- 5. TESTAR CONSULTA QUE O SISTEMA FAZ
SELECT 
    'TESTE AuthContext' as categoria,
    role, 
    name, 
    avatar_url, 
    active
FROM user_profiles 
WHERE email = 'carrocomcafe@gmail.com';

SELECT 'SUCESSO: Coluna avatar_url adicionada!' as resultado;
SELECT 'PRÓXIMO PASSO: Teste o login novamente' as instrucao; 