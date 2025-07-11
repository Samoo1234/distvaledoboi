-- Adicionar colunas CNPJ e Inscrição Estadual na tabela customers
-- Execute este comando no SQL Editor do Supabase

ALTER TABLE customers 
ADD COLUMN cnpj VARCHAR(18),
ADD COLUMN inscricao_estadual VARCHAR(20);

-- Adicionar comentários nas colunas
COMMENT ON COLUMN customers.cnpj IS 'CNPJ do cliente no formato 00.000.000/0000-00';
COMMENT ON COLUMN customers.inscricao_estadual IS 'Inscrição Estadual do cliente';

-- Índices para otimizar consultas (opcional)
CREATE INDEX idx_customers_cnpj ON customers(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_customers_inscricao_estadual ON customers(inscricao_estadual) WHERE inscricao_estadual IS NOT NULL; 