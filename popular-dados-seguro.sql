-- Script SEGURO para popular dados de teste
-- Vale do Boi - Versão sem erro de subquery

-- PRIMEIRO: Vamos pegar um usuário específico
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Pegar o primeiro usuário para usar como vendedor
    SELECT id INTO user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    -- Inserir clientes
    INSERT INTO customers (company_name, contact_name, contact_phone, address, city, state, zip_code, salesperson_id, created_at, updated_at) VALUES
    ('Açougue do Zé', 'José Silva', '(11) 98765-4321', 'Rua das Carnes, 123', 'São Paulo', 'SP', '01234-567', user_id, NOW(), NOW()),
    ('Mercado São José', 'Maria Santos', '(11) 99876-5432', 'Av. Principal, 456', 'São Paulo', 'SP', '02345-678', user_id, NOW(), NOW()),
    ('Padaria Estrela', 'João Oliveira', '(11) 97654-3210', 'Rua do Pão, 789', 'São Paulo', 'SP', '03456-789', user_id, NOW(), NOW()),
    ('Restaurante Sabor', 'Ana Costa', '(11) 96543-2109', 'Rua da Comida, 321', 'São Paulo', 'SP', '04567-890', user_id, NOW(), NOW()),
    ('Supermercado Bom Preço', 'Carlos Pereira', '(11) 95432-1098', 'Av. das Compras, 654', 'São Paulo', 'SP', '05678-901', user_id, NOW(), NOW());
    
    -- Inserir pedidos
    INSERT INTO orders (customer_id, salesperson_id, total_amount, status, payment_method, delivery_date, notes, created_at, updated_at) VALUES
    -- Pedidos pendentes
    ((SELECT id FROM customers WHERE company_name = 'Açougue do Zé' LIMIT 1), user_id, 1850.00, 'pending', 'Dinheiro', NOW() + INTERVAL '1 day', 'Pedido urgente para amanhã', NOW() - INTERVAL '2 hours', NOW()),
    ((SELECT id FROM customers WHERE company_name = 'Mercado São José' LIMIT 1), user_id, 2340.50, 'pending', 'PIX', NOW() + INTERVAL '2 days', 'Cliente preferencial', NOW() - INTERVAL '1 hour', NOW()),
    ((SELECT id FROM customers WHERE company_name = 'Padaria Estrela' LIMIT 1), user_id, 890.75, 'pending', 'Cartão', NOW() + INTERVAL '3 days', 'Entrega pela manhã', NOW() - INTERVAL '30 minutes', NOW()),
    -- Pedidos em processamento
    ((SELECT id FROM customers WHERE company_name = 'Restaurante Sabor' LIMIT 1), user_id, 3240.00, 'processing', 'Dinheiro', NOW() + INTERVAL '1 day', 'Pedido grande - cuidado na separação', NOW() - INTERVAL '3 hours', NOW()),
    ((SELECT id FROM customers WHERE company_name = 'Supermercado Bom Preço' LIMIT 1), user_id, 1560.80, 'processing', 'PIX', NOW() + INTERVAL '2 days', 'Verificar qualidade das peças', NOW() - INTERVAL '4 hours', NOW()),
    -- Pedidos concluídos
    ((SELECT id FROM customers WHERE company_name = 'Açougue do Zé' LIMIT 1), user_id, 1245.00, 'completed', 'Dinheiro', NOW(), 'Pedido separado e pronto', NOW() - INTERVAL '1 day', NOW()),
    ((SELECT id FROM customers WHERE company_name = 'Mercado São José' LIMIT 1), user_id, 2890.25, 'completed', 'PIX', NOW() - INTERVAL '1 day', 'Entrega realizada', NOW() - INTERVAL '2 days', NOW());
    
END $$;

-- DEPOIS: Popular itens dos pedidos
DO $$
DECLARE
    pedido_id UUID;
    produto_id UUID;
BEGIN
    -- Pedido 1 (Açougue do Zé - Pendente)
    SELECT id INTO pedido_id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Açougue do Zé' LIMIT 1) AND status = 'pending' LIMIT 1;
    
    -- Inserir itens do pedido 1
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at) VALUES
    (pedido_id, (SELECT id FROM products WHERE name ILIKE '%carcaça%' OR name ILIKE '%traseiro%' LIMIT 1), 25.5, 24.50, 624.75, NOW(), NOW()),
    (pedido_id, (SELECT id FROM products WHERE name ILIKE '%pernil%' OR name ILIKE '%suíno%' LIMIT 1), 35.2, 14.80, 520.96, NOW(), NOW()),
    (pedido_id, (SELECT id FROM products WHERE name ILIKE '%costela%' LIMIT 1), 38.0, 18.50, 703.00, NOW(), NOW());
    
    -- Pedido 2 (Mercado São José - Pendente)
    SELECT id INTO pedido_id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Mercado São José' LIMIT 1) AND status = 'pending' LIMIT 1;
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at) VALUES
    (pedido_id, (SELECT id FROM products WHERE name ILIKE '%meia%' OR name ILIKE '%carcaça%' LIMIT 1), 45.0, 22.30, 1003.50, NOW(), NOW()),
    (pedido_id, (SELECT id FROM products WHERE name ILIKE '%suína%' LIMIT 1), 52.0, 12.90, 670.80, NOW(), NOW()),
    (pedido_id, (SELECT id FROM products WHERE name ILIKE '%paleta%' LIMIT 1), 32.5, 20.40, 663.00, NOW(), NOW());
    
    -- Pedido 3 (Padaria Estrela - Pendente)
    SELECT id INTO pedido_id FROM orders WHERE customer_id = (SELECT id FROM customers WHERE company_name = 'Padaria Estrela' LIMIT 1) AND status = 'pending' LIMIT 1;
    
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price, created_at, updated_at) VALUES
    (pedido_id, (SELECT id FROM products WHERE name ILIKE '%fígado%' LIMIT 1), 28.0, 8.90, 249.20, NOW(), NOW()),
    (pedido_id, (SELECT id FROM products WHERE name ILIKE '%coração%' LIMIT 1), 25.5, 9.80, 249.90, NOW(), NOW()),
    (pedido_id, (SELECT id FROM products WHERE name ILIKE '%língua%' LIMIT 1), 25.2, 15.50, 390.60, NOW(), NOW());
    
END $$;

-- Verificar se deu certo
SELECT 'Clientes criados' as resultado, COUNT(*) as total FROM customers
UNION ALL
SELECT 'Pedidos criados' as resultado, COUNT(*) as total FROM orders
UNION ALL
SELECT 'Itens criados' as resultado, COUNT(*) as total FROM order_items; 