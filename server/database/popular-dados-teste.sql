-- Script para popular dados de teste
-- Distribuidora de Carnes Vale do Boi - Dados para testar separação

-- Primeiro, criar alguns clientes de teste
INSERT INTO customers (company_name, contact_name, contact_phone, address, city, state, zip_code, salesperson_id, created_at, updated_at) VALUES
('Açougue do Zé', 'José Silva', '(11) 98765-4321', 'Rua das Carnes, 123', 'São Paulo', 'SP', '01234-567', (SELECT id FROM auth.users LIMIT 1), NOW(), NOW()),
('Mercado São José', 'Maria Santos', '(11) 99876-5432', 'Av. Principal, 456', 'São Paulo', 'SP', '02345-678', (SELECT id FROM auth.users LIMIT 1), NOW(), NOW()),
('Padaria Estrela', 'João Oliveira', '(11) 97654-3210', 'Rua do Pão, 789', 'São Paulo', 'SP', '03456-789', (SELECT id FROM auth.users LIMIT 1), NOW(), NOW()),
('Restaurante Sabor', 'Ana Costa', '(11) 96543-2109', 'Rua da Comida, 321', 'São Paulo', 'SP', '04567-890', (SELECT id FROM auth.users LIMIT 1), NOW(), NOW()),
('Supermercado Bom Preço', 'Carlos Pereira', '(11) 95432-1098', 'Av. das Compras, 654', 'São Paulo', 'SP', '05678-901', (SELECT id FROM auth.users LIMIT 1), NOW(), NOW());

-- Criar alguns pedidos de teste
INSERT INTO orders (customer_id, salesperson_id, total_amount, status, payment_method, delivery_date, notes, created_at, updated_at) VALUES
-- Pedidos pendentes
((SELECT id FROM customers WHERE company_name = 'Açougue do Zé'), (SELECT id FROM auth.users LIMIT 1), 1850.00, 'pending', 'Dinheiro', NOW() + INTERVAL '1 day', 'Pedido urgente para amanhã', NOW() - INTERVAL '2 hours', NOW()),
((SELECT id FROM customers WHERE company_name = 'Mercado São José'), (SELECT id FROM auth.users LIMIT 1), 2340.50, 'pending', 'PIX', NOW() + INTERVAL '2 days', 'Cliente preferencial', NOW() - INTERVAL '1 hour', NOW()),
((SELECT id FROM customers WHERE company_name = 'Padaria Estrela'), (SELECT id FROM auth.users LIMIT 1), 890.75, 'pending', 'Cartão', NOW() + INTERVAL '3 days', 'Entrega pela manhã', NOW() - INTERVAL '30 minutes', NOW()),
-- Pedidos em processamento
((SELECT id FROM customers WHERE company_name = 'Restaurante Sabor'), (SELECT id FROM auth.users LIMIT 1), 3240.00, 'processing', 'Dinheiro', NOW() + INTERVAL '1 day', 'Pedido grande - cuidado na separação', NOW() - INTERVAL '3 hours', NOW()),
((SELECT id FROM customers WHERE company_name = 'Supermercado Bom Preço'), (SELECT id FROM auth.users LIMIT 1), 1560.80, 'processing', 'PIX', NOW() + INTERVAL '2 days', 'Verificar qualidade das peças', NOW() - INTERVAL '4 hours', NOW()),
-- Pedidos concluídos
((SELECT id FROM customers WHERE company_name = 'Açougue do Zé'), (SELECT id FROM auth.users LIMIT 1), 1245.00, 'completed', 'Dinheiro', NOW(), 'Pedido separado e pronto', NOW() - INTERVAL '1 day', NOW()),
((SELECT id FROM customers WHERE company_name = 'Mercado São José'), (SELECT id FROM auth.users LIMIT 1), 2890.25, 'completed', 'PIX', NOW() - INTERVAL '1 day', 'Entrega realizada', NOW() - INTERVAL '2 days', NOW());

-- Criar itens para os pedidos
-- Pedido 1 (Açougue do Zé - Pendente)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Açougue do Zé') AND status = 'pending' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Carcaça Bovina Traseiro' LIMIT 1), 
 25.5, 24.50, 624.75, NOW(), NOW()),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Açougue do Zé') AND status = 'pending' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Pernil Suíno' LIMIT 1), 
 35.2, 14.80, 520.96, NOW(), NOW()),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Açougue do Zé') AND status = 'pending' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Costela Bovina Inteira' LIMIT 1), 
 38.0, 18.50, 703.00, NOW(), NOW());

-- Pedido 2 (Mercado São José - Pendente)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Mercado São José') AND status = 'pending' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Meia Carcaça Bovina' LIMIT 1), 
 45.0, 22.30, 1003.50, NOW(), NOW()),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Mercado São José') AND status = 'pending' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Carcaça Suína' LIMIT 1), 
 52.0, 12.90, 670.80, NOW(), NOW()),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Mercado São José') AND status = 'pending' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Paleta Bovina' LIMIT 1), 
 32.5, 20.40, 663.00, NOW(), NOW());

-- Pedido 3 (Padaria Estrela - Pendente)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Padaria Estrela') AND status = 'pending' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Fígado Bovino' LIMIT 1), 
 28.0, 8.90, 249.20, NOW(), NOW()),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Padaria Estrela') AND status = 'pending' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Coração Bovino' LIMIT 1), 
 25.5, 9.80, 249.90, NOW(), NOW()),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Padaria Estrela') AND status = 'pending' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Língua Bovina' LIMIT 1), 
 25.2, 15.50, 390.60, NOW(), NOW());

-- Pedido 4 (Restaurante Sabor - Em processamento)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Restaurante Sabor') AND status = 'processing' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Traseiro Bovino' LIMIT 1), 
 65.0, 26.80, 1742.00, NOW(), NOW()),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Restaurante Sabor') AND status = 'processing' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Lombo Suíno Inteiro' LIMIT 1), 
 45.5, 16.20, 737.10, NOW(), NOW()),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Restaurante Sabor') AND status = 'processing' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Costela Suína Inteira' LIMIT 1), 
 61.0, 12.50, 762.50, NOW(), NOW());

-- Pedido 5 (Supermercado Bom Preço - Em processamento)
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at) VALUES
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Supermercado Bom Preço') AND status = 'processing' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Dianteiro Bovino' LIMIT 1), 
 42.0, 19.80, 831.60, NOW(), NOW()),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Supermercado Bom Preço') AND status = 'processing' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Paleta Suína' LIMIT 1), 
 38.5, 13.90, 535.15, NOW(), NOW()),
((SELECT id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Supermercado Bom Preço') AND status = 'processing' LIMIT 1), 
 (SELECT id FROM products WHERE name = 'Acém Bovino Inteiro' LIMIT 1), 
 23.0, 16.90, 388.70, NOW(), NOW());

-- Verificar dados inseridos
SELECT 'Clientes' as tipo, COUNT(*) as total FROM customers
UNION ALL
SELECT 'Pedidos' as tipo, COUNT(*) as total FROM orders
UNION ALL
SELECT 'Itens de Pedidos' as tipo, COUNT(*) as total FROM order_items;

-- Mostrar resumo dos pedidos por status
SELECT 
    status,
    COUNT(*) as quantidade,
    SUM(total_amount) as valor_total
FROM orders 
GROUP BY status 
ORDER BY status;

-- Mostrar pedidos com detalhes
SELECT 
    o.id,
    c.company_name as cliente,
    o.total_amount,
    o.status,
    o.created_at,
    COUNT(oi.id) as total_itens
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, c.company_name, o.total_amount, o.status, o.created_at
ORDER BY o.created_at DESC; 