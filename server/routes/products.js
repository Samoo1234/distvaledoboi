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
 * @route   GET /api/products
 * @desc    Listar todos os produtos
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/products/:id
 * @desc    Obter produto por ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro ao obter produto:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/products
 * @desc    Criar novo produto
 * @access  Private (admin)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description, price, stock, category, sku, image_url } = req.body;
    
    // Validação básica
    if (!name || !price) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        description, 
        price, 
        stock, 
        category, 
        sku, 
        image_url,
        created_at: new Date()
      }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/products/:id
 * @desc    Atualizar produto
 * @access  Private (admin)
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, category, sku, image_url } = req.body;
    
    // Validação básica
    if (!name || !price) {
      return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('products')
      .update({ 
        name, 
        description, 
        price, 
        stock, 
        category, 
        sku, 
        image_url,
        updated_at: new Date()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/products/:id
 * @desc    Excluir produto
 * @access  Private (admin)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
