-- Script para desabilitar RLS na tabela user_profiles
-- Use durante desenvolvimento para facilitar debugging

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;

-- Desabilitar RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Verificar se RLS está desabilitado
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles'; 