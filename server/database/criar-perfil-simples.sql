-- Criar perfil simples para o usuário
-- Execute APENAS se não aparecer "PERFIL EXISTENTE" no script anterior

-- Criar perfil básico
INSERT INTO user_profiles (id, role, name)
SELECT 
    u.id,
    'vendedor' as role,
    'Samtec Soluções' as name
FROM auth.users u
WHERE u.email = 'samtecsolucoes@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles p WHERE p.id = u.id
);

-- Atualizar com active = true (agora que a coluna existe)
UPDATE user_profiles 
SET active = true 
WHERE id IN (
    SELECT u.id FROM auth.users u WHERE u.email = 'samtecsolucoes@gmail.com'
);

-- Verificar resultado final
SELECT 
    'PERFIL CRIADO COM SUCESSO' as resultado,
    p.id,
    p.role,
    p.name,
    p.active,
    u.email
FROM user_profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'samtecsolucoes@gmail.com'; 