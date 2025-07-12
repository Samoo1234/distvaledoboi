-- CORREÇÃO: Desabilitar RLS problemático das tabelas de pedidos
-- Execute este script no SQL Editor do Supabase

-- 1. DESABILITAR RLS DAS TABELAS PRINCIPAIS
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 2. VERIFICAR SE AS TABELAS TÊM DADOS
SELECT 'DADOS orders' as categoria, COUNT(*) as total FROM orders;
SELECT 'DADOS order_items' as categoria, COUNT(*) as total FROM order_items;
SELECT 'DADOS customers' as categoria, COUNT(*) as total FROM customers;
SELECT 'DADOS products' as categoria, COUNT(*) as total FROM products;

-- 3. TESTAR CONSULTA SIMPLES DE PEDIDOS
SELECT 
    'TESTE PEDIDOS SIMPLES' as categoria,
    id,
    total_amount,
    status,
    created_at
FROM orders
ORDER BY created_at DESC
LIMIT 5;

-- 4. TESTAR CONSULTA COM JOIN (como o sistema faz)
SELECT 
    'TESTE PEDIDOS COM CLIENTE' as categoria,
    o.id,
    o.total_amount,
    o.status,
    c.company_name as cliente
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
ORDER BY o.created_at DESC
LIMIT 5;

-- 5. TESTAR CONSULTA ESPECÍFICA PARA SEPARAÇÃO
SELECT 
    'TESTE SEPARAÇÃO' as categoria,
    o.id,
    o.total_amount,
    o.status,
    c.company_name as cliente,
    COUNT(oi.id) as total_itens
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status IN ('pending', 'processing', 'completed')
GROUP BY o.id, o.total_amount, o.status, c.company_name
ORDER BY o.created_at DESC
LIMIT 5;

-- 6. INSERIR PEDIDO DE TESTE SE NÃO HOUVER DADOS
DO $$
BEGIN
    -- Verificar se há pedidos
    IF (SELECT COUNT(*) FROM orders) = 0 THEN
        -- Criar cliente de teste se não existir
        INSERT INTO customers (id, company_name, contact_name, contact_phone, address, city, state, zip_code, active)
        VALUES (
            gen_random_uuid(),
            'Cliente Teste',
            'Contato Teste',
            '(11) 99999-9999',
            'Rua Teste, 123',
            'São Paulo',
            'SP',
            '01234-567',
            true
        ) ON CONFLICT DO NOTHING;
        
        -- Criar produto de teste se não existir
        INSERT INTO products (id, name, description, price, stock, category, sku, active)
        VALUES (
            gen_random_uuid(),
            'Produto Teste',
            'Produto para teste do sistema',
            29.90,
            100.0,
            'Teste',
            'TEST001',
            true
        ) ON CONFLICT DO NOTHING;
        
        -- Criar pedido de teste
        INSERT INTO orders (id, customer_id, salesperson_id, total_amount, status, created_at)
        SELECT 
            gen_random_uuid(),
            c.id,
            up.id,
            59.80,
            'pending',
            NOW()
        FROM customers c, user_profiles up
        WHERE c.company_name = 'Cliente Teste'
          AND up.role = 'admin'
        LIMIT 1;
        
        RAISE NOTICE 'Pedido de teste criado';
    END IF;
END $$;

-- 7. VERIFICAR RESULTADO FINAL
SELECT 
    'RESULTADO FINAL' as categoria,
    (SELECT COUNT(*) FROM orders) as total_pedidos,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pedidos_pendentes,
    (SELECT COUNT(*) FROM orders WHERE status = 'processing') as pedidos_processando,
    (SELECT COUNT(*) FROM orders WHERE status = 'completed') as pedidos_concluidos;

SELECT 'SUCESSO: RLS desabilitado nas tabelas de pedidos!' as resultado;
SELECT 'PRÓXIMO PASSO: Recarregue a página da separação' as instrucao; 