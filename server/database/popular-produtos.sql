-- Script para popular tabela products com produtos reais
-- Distribuidora de Carnes Vale do Boi

-- Limpar produtos existentes (se houver)
DELETE FROM products;

-- Resetar sequence do ID
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Inserir produtos reais de distribuidora de carnes (carcaças e peças grandes)
INSERT INTO products (name, description, price, category, stock, active, sku, created_at, updated_at) VALUES

-- CARCAÇAS BOVINAS
('Carcaça Bovina Traseiro', 'Carcaça bovina traseiro completo kg', 24.50, 'Carcaças Bovinas', 12, true, 'CB001', NOW(), NOW()),
('Dianteiro Bovino', 'Dianteiro bovino completo kg', 19.80, 'Carcaças Bovinas', 15, true, 'CB002', NOW(), NOW()),
('Meia Carcaça Bovina', 'Meia carcaça bovina kg', 22.30, 'Carcaças Bovinas', 10, true, 'CB003', NOW(), NOW()),

-- CARCAÇAS SUÍNAS  
('Carcaça Suína', 'Carcaça suína completa kg', 12.90, 'Carcaças Suínas', 20, true, 'CS001', NOW(), NOW()),
('Meia Carcaça Suína', 'Meia carcaça suína kg', 13.20, 'Carcaças Suínas', 25, true, 'CS002', NOW(), NOW()),

-- PEÇAS BOVINAS GRANDES
('Traseiro Bovino', 'Traseiro bovino sem osso kg', 26.80, 'Peças Bovinas', 8, true, 'PB001', NOW(), NOW()),
('Costela Bovina Inteira', 'Costela bovina peça inteira kg', 18.50, 'Peças Bovinas', 12, true, 'PB002', NOW(), NOW()),
('Acém Bovino Inteiro', 'Acém bovino peça inteira kg', 16.90, 'Peças Bovinas', 15, true, 'PB003', NOW(), NOW()),
('Paleta Bovina', 'Paleta bovina inteira kg', 20.40, 'Peças Bovinas', 10, true, 'PB004', NOW(), NOW()),

-- PEÇAS SUÍNAS GRANDES
('Pernil Suíno', 'Pernil suíno peça inteira kg', 14.80, 'Peças Suínas', 18, true, 'PS001', NOW(), NOW()),
('Paleta Suína', 'Paleta suína inteira kg', 13.90, 'Peças Suínas', 20, true, 'PS002', NOW(), NOW()),
('Costela Suína Inteira', 'Costela suína peça inteira kg', 12.50, 'Peças Suínas', 22, true, 'PS003', NOW(), NOW()),
('Lombo Suíno Inteiro', 'Lombo suíno peça inteira kg', 16.20, 'Peças Suínas', 15, true, 'PS004', NOW(), NOW()),

-- MIÚDOS BOVINOS
('Fígado Bovino', 'Fígado bovino inteiro kg', 8.90, 'Miúdos Bovinos', 25, true, 'MB001', NOW(), NOW()),
('Coração Bovino', 'Coração bovino inteiro kg', 9.80, 'Miúdos Bovinos', 20, true, 'MB002', NOW(), NOW()),
('Língua Bovina', 'Língua bovina kg', 15.50, 'Miúdos Bovinos', 12, true, 'MB003', NOW(), NOW()),

-- MIÚDOS SUÍNOS
('Fígado Suíno', 'Fígado suíno kg', 6.90, 'Miúdos Suínos', 30, true, 'MS001', NOW(), NOW()),
('Coração Suíno', 'Coração suíno kg', 7.50, 'Miúdos Suínos', 25, true, 'MS002', NOW(), NOW());

-- Verificar se os produtos foram inseridos
SELECT COUNT(*) as total_produtos FROM products;

-- Mostrar produtos por categoria
SELECT category, COUNT(*) as quantidade, AVG(price) as preco_medio
FROM products 
WHERE active = true
GROUP BY category
ORDER BY category; 