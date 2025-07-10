# Sistema Vale do Boi - Distribuidora de Carnes

Sistema de gestão integrado para distribuidora de carnes com interface mobile para vendedores e desktop para separação/administração.

## 🚀 Status Atual: FASE 1 COMPLETA ✅

### ✅ Funcionalidades Implementadas

- **Autenticação completa** com Supabase
- **Sistema de perfis** por roles (vendedor, separacao, admin)
- **Interface PWA** responsiva e instalável
- **Database PostgreSQL** estruturado
- **Interface Mobile** para vendedores
- **Interface Desktop** para separação e admin
- **Detecção automática** de dispositivo

### 🛠️ Tecnologias

- **Frontend**: React 18+ TypeScript, Material-UI
- **Backend**: Supabase (PostgreSQL + Auth)
- **PWA**: Service Worker, Manifest
- **Estado**: Context API
- **Routing**: React Router

### 📱 Interfaces

#### Mobile (Vendedores)
- Dashboard com estatísticas
- Novo Pedido
- Meus Clientes  
- Minhas Vendas
- Suporte

#### Desktop (Separação/Admin)
- Dashboard específico por role
- Gestão de pedidos
- Relatórios (em desenvolvimento)

### 🗄️ Database

Tabelas principais:
- `user_profiles` - Perfis e roles dos usuários
- `products` - Catálogo de produtos
- `customers` - Base de clientes
- `orders` / `order_items` - Sistema de pedidos

### 🔐 Autenticação

- Login com email/senha
- Controle de acesso por roles
- RLS (Row Level Security) configurado
- Profiles automáticos na criação

### ⚙️ Configuração

1. Criar projeto no Supabase
2. Configurar variáveis de ambiente (.env):
   ```
   REACT_APP_SUPABASE_URL=sua_url
   REACT_APP_SUPABASE_ANON_KEY=sua_chave
   ```
3. Executar scripts SQL do diretório `/server/database/`
4. `npm install && npm start`

### 📋 Próximas Fases

- **Fase 2**: Sistema completo de produtos e pedidos
- **Fase 3**: Relatórios e analytics avançados  
- **Fase 4**: Integrações e otimizações

---

**Desenvolvido com ❤️ para Distribuidora Vale do Boi**
