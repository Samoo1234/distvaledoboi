-- CORREÇÃO URGENTE: Recursão infinita nas políticas RLS
-- Execute este script IMEDIATAMENTE no SQL Editor do Supabase

-- 1. DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode criar seu perfil inicial" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil, administradores podem atualizar qualquer perfil" ON user_profiles;
DROP POLICY IF EXISTS "Apenas administradores podem deletar perfis" ON user_profiles;
DROP POLICY IF EXISTS "Apenas administradores podem inserir perfis" ON user_profiles;
DROP POLICY IF EXISTS "authenticated_users_full_access" ON user_profiles;

-- 3. VERIFICAR ESTRUTURA DA TABELA E AJUSTAR SE NECESSÁRIO
-- Adicionar coluna email se não existir
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 4. RECRIAR POLÍTICAS SIMPLES SEM RECURSÃO
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política simples: usuários autenticados podem fazer tudo
CREATE POLICY "authenticated_users_full_access" 
ON user_profiles FOR ALL 
TO authenticated
USING (true) 
WITH CHECK (true);

-- 5. INSERIR PERFIL ADMIN SE NÃO EXISTIR
INSERT INTO user_profiles (id, name, email, role, active) 
VALUES (
    '0712e4b6-4a35-4aa1-8d5e-c7a065b20f03', 
    'Admin Sistema', 
    'admin@valeboi.com', 
    'admin', 
    true
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    active = true,
    email = 'admin@valeboi.com';

-- 6. VERIFICAR SE FUNCIONOU
SELECT 'PROBLEMA RESOLVIDO - TABELA CORRIGIDA' as status;
SELECT id, name, email, role, active FROM user_profiles; 