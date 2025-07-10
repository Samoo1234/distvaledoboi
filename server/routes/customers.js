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
 * @route   GET /api/customers
 * @desc    Listar todos os clientes
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('company_name');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/customers/:id
 * @desc    Obter cliente por ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro ao obter cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/customers
 * @desc    Criar novo cliente
 * @access  Private (vendedor ou admin)
 */
router.post('/', authenticate, authorize(['vendedor', 'admin']), async (req, res) => {
  try {
    const { 
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      address,
      city,
      state,
      zip_code,
      notes,
      salesperson_id 
    } = req.body;
    
    // Validação básica
    if (!company_name || !contact_phone) {
      return res.status(400).json({ error: 'Nome da empresa e telefone são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([{ 
        company_name,
        contact_name,
        contact_email,
        contact_phone,
        address,
        city,
        state,
        zip_code,
        notes,
        salesperson_id,
        created_at: new Date()
      }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/customers/:id
 * @desc    Atualizar cliente
 * @access  Private (vendedor ou admin)
 */
router.put('/:id', authenticate, authorize(['vendedor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      address,
      city,
      state,
      zip_code,
      notes,
      salesperson_id 
    } = req.body;
    
    // Validação básica
    if (!company_name || !contact_phone) {
      return res.status(400).json({ error: 'Nome da empresa e telefone são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('customers')
      .update({ 
        company_name,
        contact_name,
        contact_email,
        contact_phone,
        address,
        city,
        state,
        zip_code,
        notes,
        salesperson_id,
        updated_at: new Date()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/customers/:id
 * @desc    Excluir cliente
 * @access  Private (admin)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/customers/salesperson/:id
 * @desc    Obter clientes de um vendedor específico
 * @access  Private (vendedor, admin)
 */
router.get('/salesperson/:id', authenticate, authorize(['vendedor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('salesperson_id', id)
      .order('company_name');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao listar clientes do vendedor:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
