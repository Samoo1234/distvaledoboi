-- Script para reabilitar RLS na tabela user_profiles
-- Execute quando quiser testar com segurança ativa

-- Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários só veem o próprio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para UPDATE: usuários só editam o próprio perfil
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para INSERT: novos usuários podem criar perfil
CREATE POLICY "Users can create own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Verificar se as políticas estão ativas
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'; 