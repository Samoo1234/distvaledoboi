-- SCRIPT CORRIGIDO: Criar tabela user_profiles
-- Execute este comando no SQL Editor do Supabase

-- PASSO 1: Criar tabela user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'vendedor' CHECK (role IN ('vendedor', 'separacao', 'admin')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PASSO 2: Criar índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- PASSO 3: Criar função para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- PASSO 4: Criar trigger
CREATE OR REPLACE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- PASSO 5: Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 6: Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- PASSO 7: Criar políticas de segurança
CREATE POLICY "admins_can_view_all_profiles" 
ON user_profiles 
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles up 
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

CREATE POLICY "users_can_view_own_profile" 
ON user_profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "admins_can_insert_profiles" 
ON user_profiles 
FOR INSERT 
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles up 
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

CREATE POLICY "admins_can_update_profiles" 
ON user_profiles 
FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles up 
        WHERE up.id = auth.uid() AND up.role = 'admin'
    )
);

-- PASSO 8: Inserir dados iniciais (apenas se não existir admin)
DO $$
DECLARE 
    admin_exists BOOLEAN;
    first_user_id UUID;
    first_user_email TEXT;
BEGIN
    -- Verificar se já existe um admin
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE role = 'admin') INTO admin_exists;
    
    IF NOT admin_exists THEN
        -- Pegar o primeiro usuário da tabela auth.users
        SELECT id, email INTO first_user_id, first_user_email
        FROM auth.users 
        ORDER BY created_at 
        LIMIT 1;
        
        -- Se encontrou um usuário, criar perfil admin
        IF first_user_id IS NOT NULL THEN
            INSERT INTO user_profiles (id, name, email, role, active)
            VALUES (
                first_user_id,
                'Administrador',
                first_user_email,
                'admin',
                true
            )
            ON CONFLICT (id) DO UPDATE SET 
                role = 'admin',
                active = true;
                
            RAISE NOTICE 'Usuário admin criado com sucesso: %', first_user_email;
        END IF;
    END IF;
END $$;

-- PASSO 9: Comentários
COMMENT ON TABLE user_profiles IS 'Perfis de usuários do sistema';
COMMENT ON COLUMN user_profiles.id IS 'ID do usuário (referência para auth.users)';
COMMENT ON COLUMN user_profiles.name IS 'Nome completo do usuário';
COMMENT ON COLUMN user_profiles.email IS 'Email do usuário';
COMMENT ON COLUMN user_profiles.role IS 'Papel do usuário no sistema (vendedor, separacao, admin)';
COMMENT ON COLUMN user_profiles.active IS 'Se o usuário está ativo no sistema'; 