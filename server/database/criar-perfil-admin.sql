-- CRIAR PERFIL ADMIN para carrocomcafe@gmail.com
-- Execute este script no SQL Editor do Supabase

-- 1. CRIAR PERFIL PARA O USUÁRIO CRIADO
INSERT INTO user_profiles (id, name, email, role, active)
SELECT 
    id,
    'Admin Sistema',
    email,
    'admin',
    true
FROM auth.users 
WHERE email = 'carrocomcafe@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    name = 'Admin Sistema',
    role = 'admin',
    active = true;

-- 2. VERIFICAR SE O PERFIL FOI CRIADO
SELECT 
    'PERFIL CRIADO' as status,
    up.name,
    up.email,
    up.role,
    up.active
FROM user_profiles up
WHERE up.email = 'carrocomcafe@gmail.com';

-- 3. VERIFICAR TODOS OS USUÁRIOS E PERFIS
SELECT 
    'USUÁRIOS E PERFIS' as categoria,
    au.email as usuario_email,
    up.name as perfil_nome,
    up.role as perfil_role,
    up.active as perfil_ativo
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;

-- 4. CONTAR TOTAIS
SELECT 
    'TOTAIS' as categoria,
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM user_profiles) as total_perfis,
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'admin') as total_admins;

SELECT 'SUCESSO: Perfil admin criado para carrocomcafe@gmail.com!' as resultado;
SELECT 'PRÓXIMO PASSO: Teste o login no sistema' as instrucao; 