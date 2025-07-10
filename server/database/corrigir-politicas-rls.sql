-- Corrigir políticas RLS com recursão infinita
-- Execute no SQL Editor do Supabase

-- 1. Remover TODAS as políticas existentes da tabela user_profiles
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON user_profiles;
DROP POLICY IF EXISTS "Apenas administradores podem inserir perfis" ON user_profiles;
DROP POLICY IF EXISTS "Apenas administradores podem deletar perfis" ON user_profiles;

-- 2. Criar políticas SIMPLES para user_profiles (SEM recursão)

-- SELECT: Usuários autenticados podem ver seus próprios perfis
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
TO authenticated 
USING (id = auth.uid());

-- INSERT: Permitir apenas para service_role (criação automática via trigger)
CREATE POLICY "Enable insert for service_role only" 
ON user_profiles FOR INSERT 
TO service_role 
WITH CHECK (true);

-- UPDATE: Usuários podem atualizar seus próprios perfis
CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
TO authenticated 
USING (id = auth.uid()) 
WITH CHECK (id = auth.uid());

-- DELETE: Apenas service_role pode deletar
CREATE POLICY "Enable delete for service_role only" 
ON user_profiles FOR DELETE 
TO service_role 
USING (true);

-- 3. Verificar se as políticas foram aplicadas
SELECT 'POLÍTICAS CORRIGIDAS' as status;

-- 4. Testar acesso à tabela
SELECT 
    'TESTE DE ACESSO' as resultado,
    id,
    role,
    name,
    active
FROM user_profiles 
WHERE id = '0712e4b6-4a35-4aa1-8d5e-c7a065b20f03'; 