-- Script para verificar se as tabelas foram criadas corretamente
-- Execute este script após executar o schema-basico.sql

-- Verificar se as tabelas existem
SELECT 'user_profiles' as tabela, COUNT(*) as registros FROM user_profiles
UNION ALL
SELECT 'products' as tabela, COUNT(*) as registros FROM products
UNION ALL
SELECT 'customers' as tabela, COUNT(*) as registros FROM customers
UNION ALL
SELECT 'orders' as tabela, COUNT(*) as registros FROM orders
UNION ALL
SELECT 'order_items' as tabela, COUNT(*) as registros FROM order_items;

-- Verificar se a coluna 'active' existe na tabela user_profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name = 'active';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'products', 'customers', 'orders', 'order_items'); 