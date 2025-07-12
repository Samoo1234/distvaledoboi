-- Criar tabela user_profiles para gerenciar perfis de usuários
-- Execute este comando no SQL Editor do Supabase

-- Criar tabela user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'vendedor' CHECK (role IN ('vendedor', 'separacao', 'admin')),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Opcional
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para administradores verem todos os usuários
CREATE OR REPLACE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Política para usuários verem seus próprios perfis
CREATE OR REPLACE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT 
    USING (auth.uid() = id);

-- Política para administradores gerenciarem usuários
CREATE OR REPLACE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Comentários nas colunas
COMMENT ON TABLE user_profiles IS 'Perfis de usuários do sistema';
COMMENT ON COLUMN user_profiles.id IS 'ID do usuário (referência para auth.users)';
COMMENT ON COLUMN user_profiles.name IS 'Nome completo do usuário';
COMMENT ON COLUMN user_profiles.email IS 'Email do usuário (copiado de auth.users)';
COMMENT ON COLUMN user_profiles.role IS 'Papel do usuário no sistema';
COMMENT ON COLUMN user_profiles.active IS 'Se o usuário está ativo';

-- Inserir usuário admin padrão (ajuste o email conforme necessário)
-- IMPORTANTE: Execute apenas se não existir um admin
DO $$
BEGIN
    -- Verificar se já existe um admin
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin') THEN
        -- Tentar inserir admin baseado em usuário existente
        INSERT INTO user_profiles (id, name, email, role, active)
        SELECT 
            id, 
            COALESCE(raw_user_meta_data->>'name', 'Administrador'),
            email,
            'admin',
            true
        FROM auth.users 
        WHERE email LIKE '%admin%' OR email LIKE '%@%'
        LIMIT 1
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$; 