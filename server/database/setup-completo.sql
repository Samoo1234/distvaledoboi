-- SETUP COMPLETO - Sistema Vale do Boi
-- Execute este arquivo no SQL Editor do Supabase

-- ===================================
-- 1. EXTENSÕES
-- ===================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- 2. CRIAR TABELAS
-- ===================================

-- Tabela de perfis de usuários (MAIS IMPORTANTE)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role VARCHAR(50) NOT NULL DEFAULT 'vendedor',
    name VARCHAR(255),
    avatar_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
    category VARCHAR(100),
    sku VARCHAR(50) UNIQUE,
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    notes TEXT,
    salesperson_id UUID REFERENCES auth.users(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    salesperson_id UUID NOT NULL REFERENCES auth.users(id),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    delivery_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(10, 2) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- 3. POLÍTICAS RLS SIMPLES
-- ===================================

-- Ativa RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON products;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON orders;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON order_items;

-- Políticas simples - permitir tudo para usuários autenticados
CREATE POLICY "Allow all for authenticated users" ON user_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===================================
-- 4. CORRIGIR PERFIS DE USUÁRIOS
-- ===================================

-- Criar perfis para usuários existentes que não têm perfil
INSERT INTO user_profiles (id, role, name, active)
SELECT 
    u.id,
    'vendedor' as role,
    COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) as name,
    true as active
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, role, name, active)
    VALUES (
        NEW.id,
        'vendedor',
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um usuário for criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ===================================
-- 5. DADOS EXEMPLO
-- ===================================

-- Inserir alguns produtos exemplo
INSERT INTO products (name, description, price, stock, category, sku) 
SELECT 'Picanha Premium', 'Picanha de primeira qualidade', 89.90, 50.0, 'Carnes Nobres', 'PICA001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'PICA001');

INSERT INTO products (name, description, price, stock, category, sku) 
SELECT 'Fraldinha', 'Fraldinha maturada', 49.90, 30.0, 'Carnes', 'FRAL001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'FRAL001');

INSERT INTO products (name, description, price, stock, category, sku) 
SELECT 'Costela Bovina', 'Costela para churrasco', 34.90, 25.0, 'Carnes', 'COST001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'COST001');

-- ===================================
-- 6. VERIFICAÇÃO FINAL
-- ===================================

-- Mostrar resultado final
SELECT 'TABELAS CRIADAS' as status;

SELECT 'auth.users' as tabela, COUNT(*) as total FROM auth.users
UNION ALL
SELECT 'user_profiles' as tabela, COUNT(*) as total FROM user_profiles
UNION ALL
SELECT 'products' as tabela, COUNT(*) as total FROM products;

-- Mostrar usuários com seus perfis
SELECT 
    u.email,
    p.role,
    p.name,
    p.active,
    'PERFIL OK' as status
FROM auth.users u
JOIN user_profiles p ON u.id = p.id;

SELECT 'SETUP COMPLETO!' as resultado; 