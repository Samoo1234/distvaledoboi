-- Script para criar usuário de teste com role separacao
-- Distribuidora de Carnes Vale do Boi

-- Criar usuário de teste para separação
-- NOTA: Este script deve ser executado no SQL Editor do Supabase

-- Primeiro, vamos buscar se já existe um usuário com o email
-- Se não existir, você precisará criar manualmente no Supabase Auth

-- Inserir perfil de separação para usuário existente
-- Substitua 'USUARIO_ID_AQUI' pelo ID do usuário que você quer tornar separacao
INSERT INTO user_profiles (id, role, name, active, created_at, updated_at) 
VALUES 
-- Exemplo: substitua por um ID real de um usuário existente
-- ('12345678-1234-5678-9012-123456789012', 'separacao', 'João da Separação', true, NOW(), NOW())
('00000000-0000-0000-0000-000000000000', 'separacao', 'João da Separação', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  name = EXCLUDED.name,
  updated_at = NOW();

-- Verificar se o usuário foi criado
SELECT 
    up.id,
    up.role,
    up.name,
    au.email
FROM user_profiles up
LEFT JOIN auth.users au ON up.id = au.id
WHERE up.role = 'separacao';

-- Instruções para criar usuário completo:
-- 1. Vá para Authentication > Users no Supabase Dashboard
-- 2. Clique em "Add User" 
-- 3. Crie um usuário com:
--    - Email: separacao@valedoboi.com
--    - Password: 123456
--    - Email Confirm: true
-- 4. Copie o ID do usuário criado
-- 5. Substitua '00000000-0000-0000-0000-000000000000' pelo ID real no script acima
-- 6. Execute o script novamente

-- Exemplo de como atualizar com ID real:
-- UPDATE user_profiles 
-- SET id = 'ID_REAL_DO_USUARIO_AQUI'
-- WHERE id = '00000000-0000-0000-0000-000000000000'; 