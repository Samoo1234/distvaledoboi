const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Configuração do servidor Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Importando middleware de autenticação
const { authenticate, authorize } = require('./middleware/auth');

// Rotas da API
app.use('/api/products', require('./routes/products'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// Rota de verificação de saúde da API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Vale do Boi API',
    version: process.env.VERSION || '1.0.0'
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(`Erro: ${err.message}`);
  console.error(err.stack);
  
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Erro interno do servidor',
    path: req.path
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════════════╗
    ║                                                ║
    ║    Distribuidora de Carnes Vale do Boi API     ║
    ║                                                ║
    ╠════════════════════════════════════════════════╣
    ║                                                ║
    ║  Servidor rodando na porta: ${PORT}              ║
    ║                                                ║
    ╚════════════════════════════════════════════════╝
  `);
});
