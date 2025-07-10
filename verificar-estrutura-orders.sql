-- Verificar estrutura das tabelas
-- Vale do Boi - Debug tabela orders

-- 1. Verificar se a tabela orders existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'orders';

-- 2. Verificar colunas da tabela orders
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- 3. Verificar se a tabela customers existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'customers';

-- 4. Verificar colunas da tabela customers
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'customers'
ORDER BY ordinal_position;

-- 5. Verificar se a tabela order_items existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'order_items';

-- 6. Verificar se user_profiles existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles';

-- 7. Listar todas as tabelas do schema public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name; 