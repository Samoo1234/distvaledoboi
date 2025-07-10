-- Criar perfil para o usuário samtecsolucoes@gmail.com
-- Execute APENAS se o script anterior mostrar "USUÁRIO SEM PERFIL"

-- Criar perfil para o usuário específico
INSERT INTO user_profiles (id, role, name, active)
SELECT 
    u.id,
    'vendedor' as role,
    'Samtec Soluções' as name,  -- Nome baseado no email
    true as active
FROM auth.users u
WHERE u.email = 'samtecsolucoes@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles p WHERE p.id = u.id
);

-- Verificar se foi criado
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