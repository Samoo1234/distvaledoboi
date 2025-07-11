-- EXTENSÃO DO SISTEMA VALE DO BOI - VERSÃO CORRIGIDA
-- Implementação de Sistema de Vendedores e Logística
-- Execute no SQL Editor do Supabase APÓS o schema principal
-- VERSÃO CORRIGIDA: Ordem correta das tabelas para evitar erros de dependência

-- ===================================
-- SISTEMA DE VENDEDORES
-- ===================================

-- 1. PRIMEIRO: Tabela de territórios de vendas (deve vir antes de salesperson_profiles)
CREATE TABLE IF NOT EXISTS sales_territories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cities TEXT[], -- Array de cidades
    states VARCHAR(100)[], -- Array de estados
    zip_code_ranges JSONB, -- Faixas de CEP (ex: [{"start": "01000-000", "end": "05999-999"}])
    coordinator_id UUID REFERENCES auth.users(id),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DEPOIS: Tabela de perfis específicos de vendedores (agora pode referenciar sales_territories)
CREATE TABLE IF NOT EXISTS salesperson_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    hire_date DATE NOT NULL,
    territory_id UUID REFERENCES sales_territories(id),
    commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Porcentagem (ex: 5.00%)
    base_salary DECIMAL(10,2) DEFAULT 0,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de metas de vendas (referencia users e territories)
CREATE TABLE IF NOT EXISTS sales_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salesperson_id UUID NOT NULL REFERENCES auth.users(id),
    territory_id UUID REFERENCES sales_territories(id),
    goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('monthly', 'quarterly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    revenue_goal DECIMAL(12,2) DEFAULT 0, -- Meta de faturamento
    orders_goal INTEGER DEFAULT 0, -- Meta de pedidos
    new_customers_goal INTEGER DEFAULT 0, -- Meta de novos clientes
    current_revenue DECIMAL(12,2) DEFAULT 0, -- Faturamento atual
    current_orders INTEGER DEFAULT 0, -- Pedidos atuais
    current_new_customers INTEGER DEFAULT 0, -- Novos clientes atuais
    bonus_percentage DECIMAL(5,2) DEFAULT 0, -- Bônus por atingir meta
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de comissões calculadas (referencia users e orders)
CREATE TABLE IF NOT EXISTS sales_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salesperson_id UUID NOT NULL REFERENCES auth.users(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    commission_rate DECIMAL(5,2) NOT NULL, -- Taxa aplicada
    commission_amount DECIMAL(10,2) NOT NULL, -- Valor da comissão
    bonus_amount DECIMAL(10,2) DEFAULT 0, -- Bônus adicional
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
    payment_date DATE,
    period_month INTEGER NOT NULL, -- Mês de competência
    period_year INTEGER NOT NULL, -- Ano de competência
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- SISTEMA DE LOGÍSTICA
-- ===================================

-- 1. PRIMEIRO: Tabela de veículos/frota (independente)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plate VARCHAR(10) UNIQUE NOT NULL, -- Placa do veículo
    brand VARCHAR(100) NOT NULL, -- Marca
    model VARCHAR(100) NOT NULL, -- Modelo
    year INTEGER NOT NULL, -- Ano
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('truck', 'van', 'motorcycle', 'car')),
    capacity_weight DECIMAL(8,2), -- Capacidade em kg
    capacity_volume DECIMAL(8,2), -- Capacidade em m³
    fuel_type VARCHAR(20) DEFAULT 'diesel' CHECK (fuel_type IN ('diesel', 'gasoline', 'electric', 'hybrid')),
    current_mileage INTEGER DEFAULT 0,
    insurance_policy VARCHAR(100),
    insurance_expiry DATE,
    license_expiry DATE, -- Vencimento do licenciamento
    inspection_expiry DATE, -- Vencimento da vistoria
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_route', 'maintenance', 'inactive')),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de motoristas (independente)
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Opcional: se motorista também é usuário
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    birth_date DATE,
    license_number VARCHAR(20) UNIQUE NOT NULL, -- CNH
    license_category VARCHAR(10) NOT NULL, -- A, B, C, D, E
    license_expiry DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    hire_date DATE,
    salary DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'driving', 'resting', 'vacation', 'inactive')),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de rotas de entrega (independente)
CREATE TABLE IF NOT EXISTS delivery_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_location TEXT NOT NULL, -- Endereço de origem
    route_points JSONB, -- Array de pontos da rota com coordenadas
    estimated_duration_minutes INTEGER, -- Duração estimada em minutos
    estimated_distance_km DECIMAL(8,2), -- Distância estimada em km
    max_stops INTEGER DEFAULT 10, -- Máximo de paradas
    vehicle_types VARCHAR(20)[], -- Tipos de veículos adequados
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de entregas (referencia orders, vehicles, drivers, routes)
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    route_id UUID REFERENCES delivery_routes(id),
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(50),
    delivery_zip_code VARCHAR(20),
    scheduled_date DATE NOT NULL,
    scheduled_time_start TIME,
    scheduled_time_end TIME,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    delivery_status VARCHAR(20) DEFAULT 'scheduled' CHECK (delivery_status IN ('scheduled', 'in_transit', 'delivered', 'failed', 'cancelled')),
    delivery_proof JSONB, -- Fotos, assinaturas, etc.
    recipient_name VARCHAR(255),
    recipient_document VARCHAR(20),
    special_instructions TEXT,
    delivery_fee DECIMAL(8,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de manutenção de veículos (referencia vehicles)
CREATE TABLE IF NOT EXISTS vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective', 'inspection', 'emergency')),
    description TEXT NOT NULL,
    scheduled_date DATE,
    completed_date DATE,
    mileage_at_service INTEGER,
    service_provider VARCHAR(255), -- Oficina/prestador
    cost DECIMAL(10,2) DEFAULT 0,
    parts_replaced TEXT[], -- Array de peças substituídas
    next_service_mileage INTEGER,
    next_service_date DATE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================
-- ÍNDICES PARA PERFORMANCE
-- ===================================

-- Índices do sistema de vendedores
CREATE INDEX IF NOT EXISTS idx_sales_territories_name ON sales_territories(name);
CREATE INDEX IF NOT EXISTS idx_sales_territories_coordinator ON sales_territories(coordinator_id);

CREATE INDEX IF NOT EXISTS idx_salesperson_profiles_user_id ON salesperson_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_salesperson_profiles_territory ON salesperson_profiles(territory_id);
CREATE INDEX IF NOT EXISTS idx_salesperson_profiles_employee_code ON salesperson_profiles(employee_code);

CREATE INDEX IF NOT EXISTS idx_sales_goals_salesperson ON sales_goals(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_sales_goals_period ON sales_goals(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_sales_goals_territory ON sales_goals(territory_id);

CREATE INDEX IF NOT EXISTS idx_sales_commissions_salesperson ON sales_commissions(salesperson_id);
CREATE INDEX IF NOT EXISTS idx_sales_commissions_order ON sales_commissions(order_id);
CREATE INDEX IF NOT EXISTS idx_sales_commissions_period ON sales_commissions(period_year, period_month);

-- Índices do sistema de logística
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(vehicle_type);

CREATE INDEX IF NOT EXISTS idx_drivers_cpf ON drivers(cpf);
CREATE INDEX IF NOT EXISTS idx_drivers_license ON drivers(license_number);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);

CREATE INDEX IF NOT EXISTS idx_delivery_routes_name ON delivery_routes(name);

CREATE INDEX IF NOT EXISTS idx_deliveries_order ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_vehicle ON deliveries(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver ON deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_vehicle ON vehicle_maintenance(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_date ON vehicle_maintenance(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_maintenance_status ON vehicle_maintenance(status);

-- ===================================
-- TRIGGERS PARA ATUALIZAR TIMESTAMPS
-- ===================================

-- Verifica se a função existe antes de criar os triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para o sistema de vendedores
CREATE TRIGGER update_sales_territories_updated_at
BEFORE UPDATE ON sales_territories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salesperson_profiles_updated_at
BEFORE UPDATE ON salesperson_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_goals_updated_at
BEFORE UPDATE ON sales_goals
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_commissions_updated_at
BEFORE UPDATE ON sales_commissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para o sistema de logística
CREATE TRIGGER update_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
BEFORE UPDATE ON drivers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_routes_updated_at
BEFORE UPDATE ON delivery_routes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at
BEFORE UPDATE ON deliveries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_maintenance_updated_at
BEFORE UPDATE ON vehicle_maintenance
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- POLÍTICAS RLS SIMPLES
-- ===================================

-- Ativar RLS para todas as novas tabelas
ALTER TABLE sales_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE salesperson_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_maintenance ENABLE ROW LEVEL SECURITY;

-- Políticas simples - usuários autenticados podem acessar
CREATE POLICY "Allow all for authenticated users" ON sales_territories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON salesperson_profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON sales_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON sales_commissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON drivers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON delivery_routes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON deliveries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for authenticated users" ON vehicle_maintenance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ===================================
-- DADOS EXEMPLO/INICIAIS
-- ===================================

-- Inserir territórios exemplo
INSERT INTO sales_territories (name, description, cities, states) VALUES
('São Paulo Capital', 'Região metropolitana de São Paulo', ARRAY['São Paulo', 'Osasco', 'Guarulhos'], ARRAY['SP']),
('Interior SP', 'Cidades do interior de São Paulo', ARRAY['Campinas', 'Ribeirão Preto', 'São José dos Campos'], ARRAY['SP']),
('Rio de Janeiro', 'Estado do Rio de Janeiro', ARRAY['Rio de Janeiro', 'Niterói', 'Petrópolis'], ARRAY['RJ']),
('Minas Gerais', 'Estado de Minas Gerais', ARRAY['Belo Horizonte', 'Uberlândia', 'Juiz de Fora'], ARRAY['MG'])
ON CONFLICT DO NOTHING;

-- Inserir veículos exemplo
INSERT INTO vehicles (plate, brand, model, year, vehicle_type, capacity_weight, capacity_volume) VALUES
('ABC-1234', 'Mercedes-Benz', 'Accelo 815', 2020, 'truck', 3500.00, 15.00),
('DEF-5678', 'Volkswagen', 'Delivery Express', 2019, 'truck', 2800.00, 12.00),
('GHI-9012', 'Iveco', 'Daily 35S14', 2021, 'van', 1500.00, 8.00),
('JKL-3456', 'Ford', 'Transit', 2018, 'van', 1200.00, 6.00)
ON CONFLICT DO NOTHING;

-- Inserir motoristas exemplo
INSERT INTO drivers (name, cpf, license_number, license_category, license_expiry, phone) VALUES
('João Silva dos Santos', '123.456.789-00', '12345678901', 'D', '2025-12-31', '(11) 99999-1111'),
('Maria Oliveira Costa', '987.654.321-00', '10987654321', 'D', '2025-08-15', '(11) 99999-2222'),
('Carlos Pereira Lima', '555.666.777-88', '55566677788', 'D', '2024-06-30', '(11) 99999-3333'),
('Ana Santos Ferreira', '111.222.333-44', '11122233344', 'C', '2025-03-20', '(11) 99999-4444')
ON CONFLICT DO NOTHING;

-- Inserir rotas exemplo
INSERT INTO delivery_routes (name, description, start_location, estimated_duration_minutes, estimated_distance_km) VALUES
('Rota Centro SP', 'Entrega na região central de São Paulo', 'Rua das Carnes, 123 - São Paulo, SP', 240, 45.5),
('Rota Zona Sul SP', 'Entrega na zona sul de São Paulo', 'Rua das Carnes, 123 - São Paulo, SP', 180, 32.0),
('Rota ABC Paulista', 'Entrega no ABC Paulista', 'Rua das Carnes, 123 - São Paulo, SP', 300, 65.2),
('Rota Interior SP', 'Entrega nas cidades do interior', 'Rua das Carnes, 123 - São Paulo, SP', 480, 120.0)
ON CONFLICT DO NOTHING;

-- Mensagem de sucesso
SELECT 'TABELAS DE VENDEDORES E LOGÍSTICA CRIADAS COM SUCESSO! ORDEM CORRETA!' as resultado; 