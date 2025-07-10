-- TESTE BÁSICO - Só o essencial
-- Vale do Boi - Teste sem complicação

-- 1. Limpar dados existentes (se houver)
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM customers;

-- 2. Inserir clientes básicos
INSERT INTO customers (company_name, contact_name, contact_phone, created_at, updated_at) VALUES
('Teste Cliente 1', 'João Silva', '11999999999', NOW(), NOW()),
('Teste Cliente 2', 'Maria Santos', '11888888888', NOW(), NOW());

-- 3. Inserir pedidos básicos (SEM salesperson_id)
INSERT INTO orders (customer_id, total_amount, status, created_at, updated_at) VALUES
((SELECT id FROM customers WHERE company_name = 'Teste Cliente 1'), 100.00, 'pending', NOW(), NOW()),
((SELECT id FROM customers WHERE company_name = 'Teste Cliente 2'), 200.00, 'processing', NOW(), NOW());

-- 4. Verificar se funcionou
SELECT 
    'Teste funcionou!' as resultado,
    COUNT(c.id) as clientes,
    COUNT(o.id) as pedidos
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id; 