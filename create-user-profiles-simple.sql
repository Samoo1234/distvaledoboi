-- SCRIPT SIMPLES: Criar tabela user_profiles
-- Execute linha por linha no SQL Editor do Supabase

-- Criar apenas a tabela básica
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'vendedor' CHECK (role IN ('vendedor', 'separacao', 'admin')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS básico
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política simples: qualquer usuário autenticado pode ver os perfis
CREATE POLICY "authenticated_users_can_view_profiles" 
ON user_profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Política simples: qualquer usuário autenticado pode inserir/atualizar
CREATE POLICY "authenticated_users_can_manage_profiles" 
ON user_profiles 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true); 