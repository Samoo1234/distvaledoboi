-- INSERIR DADOS MANUAL - Sem subquery
-- Vale do Boi - Versão que funciona

-- 1. Inserir clientes primeiro
INSERT INTO customers (company_name, contact_name, contact_phone, created_at, updated_at) VALUES
('Açougue do Zé', 'José Silva', '11999999999', NOW(), NOW()),
('Mercado São José', 'Maria Santos', '11888888888', NOW(), NOW());

-- 2. Ver os IDs dos clientes que foram criados
SELECT id, company_name FROM customers ORDER BY created_at DESC LIMIT 2; 