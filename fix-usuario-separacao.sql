-- Script SIMPLES para corrigir usuário de separação
-- Vale do Boi - Correção Rápida

-- 1. Verificar usuário
SELECT id, email FROM auth.users WHERE email = 'separacao@valedoboi.com';

-- 2. Inserir/atualizar perfil (execute depois de ver o resultado acima)
INSERT INTO user_profiles (id, role, name, active, created_at, updated_at) 
VALUES (
    (SELECT id FROM auth.users WHERE email = 'separacao@valedoboi.com'),
    'separacao',
    'João da Separação',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
    role = 'separacao',
    name = 'João da Separação',
    active = true,
    updated_at = NOW();

-- 3. Verificar se funcionou
SELECT 
    au.email,
    up.role,
    up.name,
    up.active
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'separacao@valedoboi.com'; 