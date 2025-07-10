-- Schema SQL LIMPO para resolver conflitos - Sistema Vale do Boi
-- Execute este arquivo no SQL Editor do Supabase
-- Resolve conflitos quando alguns elementos já existem

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remove triggers existentes antes de recriar
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Remove políticas existentes antes de recriar
DROP POLICY IF EXISTS "Produtos visíveis para todos os usuários autenticados" ON products;
DROP POLICY IF EXISTS "Apenas administradores podem inserir produtos" ON products;
DROP POLICY IF EXISTS "Apenas administradores podem atualizar produtos" ON products;
DROP POLICY IF EXISTS "Apenas administradores podem deletar produtos" ON products;

DROP POLICY IF EXISTS "Vendedores veem apenas seus clientes" ON customers;
DROP POLICY IF EXISTS "Vendedores e administradores podem inserir clientes" ON customers;
DROP POLICY IF EXISTS "Vendedores atualizam apenas seus clientes, admins atualizam qualquer cliente" ON customers;
DROP POLICY IF EXISTS "Apenas administradores podem deletar clientes" ON customers;

DROP POLICY IF EXISTS "Vendedores veem apenas seus pedidos" ON orders;
DROP POLICY IF EXISTS "Vendedores e administradores podem inserir pedidos" ON orders;
DROP POLICY IF EXISTS "Vendedores atualizam apenas seus pedidos, admin/separacao podem atualizar qualquer pedido" ON orders;
DROP POLICY IF EXISTS "Apenas administradores podem deletar pedidos" ON orders;

DROP POLICY IF EXISTS "Vendedores veem apenas itens de seus pedidos" ON order_items;
DROP POLICY IF EXISTS "Vendedores e administradores podem inserir itens de pedidos" ON order_items;
DROP POLICY IF EXISTS "Vendedores atualizam apenas itens de seus pedidos, admin/separacao podem atualizar qualquer item" ON order_items;
DROP POLICY IF EXISTS "Apenas administradores podem deletar itens de pedidos" ON order_items;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON user_profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON user_profiles;
DROP POLICY IF EXISTS "Apenas administradores podem inserir perfis" ON user_profiles;
DROP POLICY IF EXISTS "Apenas administradores podem deletar perfis" ON user_profiles;

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

-- Índices para tabela de produtos
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

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

-- Índices para tabela de clientes
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_name);
CREATE INDEX IF NOT EXISTS idx_customers_salesperson ON customers(salesperson_id);

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

-- Índices para tabela de pedidos
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_salesperson ON orders(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

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

-- Índices para tabela de itens do pedido
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role VARCHAR(50) NOT NULL DEFAULT 'vendedor',
    name VARCHAR(255),
    avatar_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria índice para coluna role na tabela user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Função para atualizar o timestamp de updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar o timestamp de updated_at automaticamente
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Ativa RLS para todas as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =======================================================
-- POLÍTICAS PARA PRODUTOS
-- =======================================================

CREATE POLICY "Produtos visíveis para todos os usuários autenticados"
ON products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Apenas administradores podem inserir produtos"
ON products FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin'));

CREATE POLICY "Apenas administradores podem atualizar produtos"
ON products FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin'));

CREATE POLICY "Apenas administradores podem deletar produtos"
ON products FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin'));

-- =======================================================
-- POLÍTICAS PARA CLIENTES
-- =======================================================

CREATE POLICY "Vendedores veem apenas seus clientes"
ON customers FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'separacao') OR 
    salesperson_id = auth.uid()
);

CREATE POLICY "Vendedores e administradores podem inserir clientes"
ON customers FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'vendedor')
);

CREATE POLICY "Vendedores atualizam apenas seus clientes, admins atualizam qualquer cliente"
ON customers FOR UPDATE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    salesperson_id = auth.uid()
)
WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    salesperson_id = auth.uid()
);

CREATE POLICY "Apenas administradores podem deletar clientes"
ON customers FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin'));

-- =======================================================
-- POLÍTICAS PARA PEDIDOS
-- =======================================================

CREATE POLICY "Vendedores veem apenas seus pedidos"
ON orders FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'separacao') OR 
    salesperson_id = auth.uid()
);

CREATE POLICY "Vendedores e administradores podem inserir pedidos"
ON orders FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'vendedor')
);

CREATE POLICY "Vendedores atualizam apenas seus pedidos, admin/separacao podem atualizar qualquer pedido"
ON orders FOR UPDATE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'separacao') OR
    salesperson_id = auth.uid()
)
WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'separacao') OR
    salesperson_id = auth.uid()
);

CREATE POLICY "Apenas administradores podem deletar pedidos"
ON orders FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin'));

-- =======================================================
-- POLÍTICAS PARA ITENS DE PEDIDOS
-- =======================================================

CREATE POLICY "Vendedores veem apenas itens de seus pedidos"
ON order_items FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'separacao') OR 
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.salesperson_id = auth.uid())
);

CREATE POLICY "Vendedores e administradores podem inserir itens de pedidos"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.salesperson_id = auth.uid())
);

CREATE POLICY "Vendedores atualizam apenas itens de seus pedidos, admin/separacao podem atualizar qualquer item"
ON order_items FOR UPDATE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'separacao') OR
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.salesperson_id = auth.uid())
)
WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin') OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'separacao') OR
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.salesperson_id = auth.uid())
);

CREATE POLICY "Apenas administradores podem deletar itens de pedidos"
ON order_items FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin'));

-- =======================================================
-- POLÍTICAS PARA PERFIS DE USUÁRIOS
-- =======================================================

CREATE POLICY "Usuários podem ver seus próprios perfis"
ON user_profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Apenas administradores podem inserir perfis"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin'));

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
ON user_profiles FOR UPDATE
TO authenticated
USING (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin')
)
WITH CHECK (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Apenas administradores podem deletar perfis"
ON user_profiles FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND role = 'admin'));

-- =======================================================
-- DADOS INICIAIS
-- =======================================================

-- Inserir alguns produtos exemplo (apenas se não existirem)
INSERT INTO products (name, description, price, stock, category, sku) 
SELECT 'Picanha Premium', 'Picanha de primeira qualidade', 89.90, 50.0, 'Carnes Nobres', 'PICA001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'PICA001');

INSERT INTO products (name, description, price, stock, category, sku) 
SELECT 'Fraldinha', 'Fraldinha maturada', 49.90, 30.0, 'Carnes', 'FRAL001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'FRAL001');

INSERT INTO products (name, description, price, stock, category, sku) 
SELECT 'Costela Bovina', 'Costela para churrasco', 34.90, 25.0, 'Carnes', 'COST001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'COST001');

INSERT INTO products (name, description, price, stock, category, sku) 
SELECT 'Linguiça Artesanal', 'Linguiça defumada', 24.90, 40.0, 'Embutidos', 'LING001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'LING001');

INSERT INTO products (name, description, price, stock, category, sku) 
SELECT 'Alcatra', 'Alcatra fatiada', 59.90, 35.0, 'Carnes', 'ALCA001'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = 'ALCA001'); 