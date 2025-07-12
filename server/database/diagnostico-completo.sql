-- DIAGNÓSTICO COMPLETO: Database error creating new user
-- Execute este script no SQL Editor do Supabase para diagnóstico

-- 1. VERIFICAR EXTENSÕES NECESSÁRIAS
SELECT 
    'EXTENSÕES' as categoria,
    extname as nome,
    CASE WHEN extname = 'uuid-ossp' THEN 'NECESSÁRIA' ELSE 'OPCIONAL' END as status
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto')
ORDER BY extname;

-- 2. VERIFICAR TABELAS EXISTENTES
SELECT 
    'TABELAS' as categoria,
    table_name as nome,
    CASE 
        WHEN table_name = 'user_profiles' THEN 'CRÍTICA'
        WHEN table_name IN ('products', 'customers', 'orders') THEN 'IMPORTANTE'
        ELSE 'OPCIONAL'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. VERIFICAR ESTRUTURA DA TABELA user_profiles
SELECT 
    'COLUNAS user_profiles' as categoria,
    column_name as nome,
    data_type as tipo,
    is_nullable as permite_nulo,
    column_default as padrao
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 
    'POLÍTICAS RLS' as categoria,
    schemaname,
    tablename,
    policyname as nome,
    cmd as comando,
    permissive as permissivo
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 5. VERIFICAR TRIGGERS
SELECT 
    'TRIGGERS' as categoria,
    trigger_name as nome,
    event_manipulation as evento,
    action_timing as momento,
    action_statement as acao
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
   OR event_object_table = 'user_profiles'
ORDER BY trigger_name;

-- 6. VERIFICAR FUNÇÕES
SELECT 
    'FUNÇÕES' as categoria,
    routine_name as nome,
    routine_type as tipo,
    routine_definition as definicao
FROM information_schema.routines 
WHERE routine_name LIKE '%user%profile%'
   OR routine_name LIKE '%create_user%'
ORDER BY routine_name;

-- 7. VERIFICAR USUÁRIOS EXISTENTES
SELECT 
    'USUÁRIOS AUTH' as categoria,
    COUNT(*) as total,
    'Total de usuários em auth.users' as descricao
FROM auth.users;

-- 8. VERIFICAR PERFIS EXISTENTES
SELECT 
    'PERFIS' as categoria,
    COUNT(*) as total,
    'Total de perfis em user_profiles' as descricao
FROM user_profiles;

-- 9. VERIFICAR USUÁRIOS SEM PERFIL
SELECT 
    'USUÁRIOS SEM PERFIL' as categoria,
    COUNT(*) as total,
    'Usuários que não têm perfil' as descricao
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 10. VERIFICAR SE RLS ESTÁ ATIVO
SELECT 
    'RLS STATUS' as categoria,
    tablename as tabela,
    rowsecurity as ativo
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 11. TESTAR CRIAÇÃO DE PERFIL MANUAL
-- Vamos tentar criar um perfil manualmente para ver se funciona
DO $$
BEGIN
    -- Tentar inserir um perfil de teste
    INSERT INTO user_profiles (id, name, role, active, email)
    VALUES (
        gen_random_uuid(),
        'Teste Diagnóstico',
        'vendedor',
        true,
        'teste@diagnostico.com'
    );
    
    RAISE NOTICE 'SUCESSO: Perfil de teste criado com sucesso';
    
    -- Remover o perfil de teste
    DELETE FROM user_profiles WHERE email = 'teste@diagnostico.com';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERRO ao criar perfil: %', SQLERRM;
END $$;

-- 12. VERIFICAR PERMISSÕES DE USUÁRIO
SELECT 
    'PERMISSÕES' as categoria,
    current_user as usuario_atual,
    session_user as usuario_sessao,
    current_database() as database_atual;

-- 13. VERIFICAR CONFIGURAÇÕES DO PROJETO
SELECT 
    'CONFIGURAÇÕES' as categoria,
    setting as nome,
    current_setting(setting) as valor
FROM (
    VALUES 
        ('log_statement'),
        ('log_min_error_statement'),
        ('shared_preload_libraries'),
        ('max_connections')
) AS t(setting);

-- 14. RESUMO DO DIAGNÓSTICO
SELECT 
    'RESUMO' as categoria,
    'Diagnóstico completo executado' as resultado,
    'Verifique os resultados acima para identificar o problema' as instrucao; 