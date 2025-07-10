-- Versão ULTRA SIMPLES para popular dados
-- Vale do Boi - Sem complicação

-- 1. Inserir clientes (simples)
INSERT INTO customers (company_name, contact_name, contact_phone, address, city, state, zip_code, created_at, updated_at) VALUES
('Açougue do Zé', 'José Silva', '(11) 98765-4321', 'Rua das Carnes, 123', 'São Paulo', 'SP', '01234-567', NOW(), NOW()),
('Mercado São José', 'Maria Santos', '(11) 99876-5432', 'Av. Principal, 456', 'São Paulo', 'SP', '02345-678', NOW(), NOW()),
('Padaria Estrela', 'João Oliveira', '(11) 97654-3210', 'Rua do Pão, 789', 'São Paulo', 'SP', '03456-789', NOW(), NOW());

-- 2. Inserir pedidos (simples)
-- Vamos usar os IDs que acabaram de ser criados
INSERT INTO orders (customer_id, total_amount, status, payment_method, notes, created_at, updated_at) VALUES
((SELECT id FROM customers WHERE company_name = 'Açougue do Zé'), 1850.00, 'pending', 'Dinheiro', 'Pedido urgente', NOW() - INTERVAL '2 hours', NOW()),
((SELECT id FROM customers WHERE company_name = 'Mercado São José'), 2340.50, 'pending', 'PIX', 'Cliente preferencial', NOW() - INTERVAL '1 hour', NOW()),
((SELECT id FROM customers WHERE company_name = 'Padaria Estrela'), 890.75, 'processing', 'Cartão', 'Em separação', NOW() - INTERVAL '30 minutes', NOW());

-- 3. Verificar se criou
SELECT 'Clientes' as tipo, COUNT(*) as total FROM customers
UNION ALL
SELECT 'Pedidos' as tipo, COUNT(*) as total FROM orders; 