const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * @route   GET /api/orders
 * @desc    Listar todos os pedidos
 * @access  Private (admin, separacao)
 */
router.get('/', authenticate, authorize(['admin', 'separacao']), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers:customer_id (company_name, contact_name),
        users:salesperson_id (email, user_metadata->>name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Obter pedido por ID com itens
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Busca pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        customers:customer_id (id, company_name, contact_name, contact_phone, address, city),
        users:salesperson_id (id, email, user_metadata->>name)
      `)
      .eq('id', id)
      .single();

    if (orderError) throw orderError;

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Busca itens do pedido
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products:product_id (id, name, sku, price)
      `)
      .eq('order_id', id)
      .order('created_at');

    if (itemsError) throw itemsError;

    // Combina os resultados
    order.items = orderItems || [];

    res.json(order);
  } catch (error) {
    console.error('Erro ao obter pedido:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/orders
 * @desc    Criar novo pedido com itens
 * @access  Private (vendedor, admin)
 */
router.post('/', authenticate, authorize(['vendedor', 'admin']), async (req, res) => {
  try {
    const { 
      customer_id,
      salesperson_id,
      total_amount,
      status,
      payment_method,
      delivery_date,
      notes,
      items 
    } = req.body;
    
    // Validação básica
    if (!customer_id || !salesperson_id || !items || !items.length) {
      return res.status(400).json({ 
        error: 'Cliente, vendedor e pelo menos um item são obrigatórios' 
      });
    }

    // Inicia transação
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{ 
        customer_id,
        salesperson_id,
        total_amount,
        status: status || 'pending',
        payment_method,
        delivery_date,
        notes,
        created_at: new Date()
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insere itens do pedido
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      created_at: new Date()
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    res.status(201).json({ 
      ...order,
      message: 'Pedido criado com sucesso',
      items_count: items.length 
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/orders/:id
 * @desc    Atualizar pedido
 * @access  Private (vendedor, admin)
 */
router.put('/:id', authenticate, authorize(['vendedor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      total_amount,
      status,
      payment_method,
      delivery_date,
      notes
    } = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        total_amount,
        status,
        payment_method,
        delivery_date,
        notes,
        updated_at: new Date()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Atualizar status do pedido
 * @access  Private (separacao, admin)
 */
router.put('/:id/status', authenticate, authorize(['separacao', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório' });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/orders/salesperson/:id
 * @desc    Obter pedidos de um vendedor específico
 * @access  Private (vendedor, admin)
 */
router.get('/salesperson/:id', authenticate, authorize(['vendedor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers:customer_id (company_name)
      `)
      .eq('salesperson_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao listar pedidos do vendedor:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/orders/customer/:id
 * @desc    Obter pedidos de um cliente específico
 * @access  Private
 */
router.get('/customer/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users:salesperson_id (email, user_metadata->>name)
      `)
      .eq('customer_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao listar pedidos do cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
