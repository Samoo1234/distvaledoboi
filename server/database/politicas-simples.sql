-- Políticas simples e abertas para teste
-- Execute no SQL Editor do Supabase

-- 1. Remover políticas existentes
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for service_role only" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for service_role only" ON user_profiles;

-- 2. Criar política simples: usuários autenticados podem fazer tudo na user_profiles
CREATE POLICY "Authenticated users full access" 
ON user_profiles FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Verificar
SELECT 'POLÍTICAS SIMPLES APLICADAS' as status;

-- 4. Testar acesso
SELECT id, role, name, active 
FROM user_profiles 
WHERE id = '0712e4b6-4a35-4aa1-8d5e-c7a065b20f03'; 