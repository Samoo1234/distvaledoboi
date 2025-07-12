-- DIAGNÓSTICO: Pedidos não aparecem na interface
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR SE AS TABELAS DE PEDIDOS EXISTEM
SELECT 
    'TABELAS' as categoria,
    table_name as nome,
    CASE 
        WHEN table_name IN ('orders', 'order_items') THEN 'CRÍTICA'
        ELSE 'OPCIONAL'
    END as importancia
FROM information_schema.tables 
WHERE table_schema = 'public'
    AND table_name IN ('orders', 'order_items', 'customers', 'products')
ORDER BY table_name;

-- 2. CONTAR REGISTROS EM CADA TABELA
SELECT 'ORDERS' as tabela, COUNT(*) as total FROM orders;
SELECT 'ORDER_ITEMS' as tabela, COUNT(*) as total FROM order_items;
SELECT 'CUSTOMERS' as tabela, COUNT(*) as total FROM customers;
SELECT 'PRODUCTS' as tabela, COUNT(*) as total FROM products;

-- 3. VERIFICAR SE RLS ESTÁ ATIVO NAS TABELAS DE PEDIDOS
SELECT 
    'RLS STATUS' as categoria,
    tablename as tabela,
    rowsecurity as rls_ativo
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items', 'customers', 'products');

-- 4. VERIFICAR POLÍTICAS RLS EM orders
SELECT 
    'POLÍTICAS orders' as categoria,
    policyname as nome_politica,
    cmd as comando,
    permissive as permissivo
FROM pg_policies 
WHERE tablename = 'orders';

-- 5. VERIFICAR POLÍTICAS RLS EM order_items
SELECT 
    'POLÍTICAS order_items' as categoria,
    policyname as nome_politica,
    cmd as comando,
    permissive as permissivo
FROM pg_policies 
WHERE tablename = 'order_items';

-- 6. TESTAR CONSULTA DE PEDIDOS SIMPLES
SELECT 
    'TESTE CONSULTA ORDERS' as categoria,
    o.id,
    o.total_amount,
    o.status,
    o.created_at
FROM orders o
ORDER BY o.created_at DESC
LIMIT 3;

-- 7. TESTAR CONSULTA COMPLETA (como o sistema faz)
SELECT 
    'TESTE CONSULTA COMPLETA' as categoria,
    o.id,
    o.total_amount,
    o.status,
    o.created_at,
    c.company_name as customer_name
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC
LIMIT 3;

-- 8. VERIFICAR SE HÁ USUÁRIOS SEM PERFIL QUE PODEM TER CRIADO PEDIDOS
SELECT 
    'PEDIDOS SEM VENDEDOR VÁLIDO' as categoria,
    o.id,
    o.salesperson_id,
    up.name as vendedor_nome
FROM orders o
LEFT JOIN user_profiles up ON o.salesperson_id = up.id
WHERE up.id IS NULL;

-- 9. VERIFICAR FOREIGN KEYS DAS TABELAS
SELECT 
    'FOREIGN KEYS' as categoria,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('orders', 'order_items');

-- 10. RESUMO DO DIAGNÓSTICO
SELECT 'RESUMO' as categoria, 'Diagnóstico de pedidos executado' as resultado; 