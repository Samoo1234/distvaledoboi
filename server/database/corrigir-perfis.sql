-- Script para corrigir usuários sem perfil
-- Execute APÓS o diagnostico-usuarios.sql

-- 1. Criar perfis para usuários existentes que não têm perfil
INSERT INTO user_profiles (id, role, name, active)
SELECT 
    u.id,
    'vendedor' as role,  -- role padrão
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name,
    true as active
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 2. Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, role, name, active)
    VALUES (
        NEW.id,
        'vendedor',  -- role padrão
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para executar a função quando um usuário for criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 4. Verificar se funcionou
SELECT 
    'Usuários com perfil' as status,
    COUNT(*) as total
FROM auth.users u
JOIN user_profiles p ON u.id = p.id

UNION ALL

SELECT 
    'Usuários SEM perfil' as status,
    COUNT(*) as total
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL; 