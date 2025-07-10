-- Criar tabelas para sistema de pedidos
-- Vale do Boi - Sistema de Pedidos

-- 1. Criar tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(200) NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    salesperson_id UUID REFERENCES auth.users(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    salesperson_id UUID NOT NULL REFERENCES auth.users(id),
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    payment_method VARCHAR(50),
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de itens dos pedidos
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_salesperson_id ON orders(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_customers_salesperson_id ON customers(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(active);

-- 5. Criar políticas RLS (Row Level Security)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Política para customers
CREATE POLICY "Users can view customers" ON customers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert customers" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update customers" ON customers
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para orders
CREATE POLICY "Users can view orders" ON orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert orders" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update orders" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para order_items
CREATE POLICY "Users can view order_items" ON order_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert order_items" ON order_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update order_items" ON order_items
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customers', 'orders', 'order_items')
ORDER BY table_name; 