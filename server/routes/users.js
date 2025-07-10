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
 * @route   GET /api/users
 * @desc    Listar todos os usuários (apenas para administradores)
 * @access  Private (admin)
 */
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, user_metadata, role, created_at, last_sign_in_at')
      .order('created_at');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Obter usuário por ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .select('id, email, user_metadata, role, created_at, last_sign_in_at')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/users
 * @desc    Criar novo usuário (apenas para administradores)
 * @access  Private (admin)
 */
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;
    
    // Validação básica
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, senha e role são obrigatórios' });
    }

    // Verifica se o role é válido
    if (!['vendedor', 'separacao', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role inválido. Deve ser vendedor, separacao ou admin' });
    }

    // Cria o usuário no Auth
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        phone
      },
      email_confirm: true, // Confirma o email automaticamente
    });

    if (authError) throw authError;

    // Define o role do usuário
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userData.user.id);

    if (updateError) throw updateError;

    res.status(201).json({
      id: userData.user.id,
      email: userData.user.email,
      role,
      name,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Atualizar usuário (apenas para administradores)
 * @access  Private (admin)
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, active } = req.body;

    // Atualiza os metadados do usuário
    if (name || phone) {
      const { data, error: updateMetadataError } = await supabase.auth.admin.updateUserById(
        id,
        {
          user_metadata: {
            name,
            phone
          }
        }
      );

      if (updateMetadataError) throw updateMetadataError;
    }

    // Atualiza o role do usuário
    if (role) {
      // Verifica se o role é válido
      if (!['vendedor', 'separacao', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Role inválido. Deve ser vendedor, separacao ou admin' });
      }

      const { error: updateRoleError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id);

      if (updateRoleError) throw updateRoleError;
    }

    // Define o status do usuário (ativo/inativo)
    if (active !== undefined) {
      await supabase.auth.admin.updateUserById(
        id,
        { banned: !active }
      );
    }

    // Recupera o usuário atualizado
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('id, email, user_metadata, role, created_at, last_sign_in_at')
      .eq('id', id)
      .single();

    if (getUserError) throw getUserError;

    res.json({
      ...userData,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/users/:id/reset-password
 * @desc    Enviar email de redefinição de senha (apenas para administradores)
 * @access  Private (admin)
 */
router.post('/:id/reset-password', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Busca o email do usuário
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('email')
      .eq('id', id)
      .single();

    if (getUserError) throw getUserError;

    if (!userData) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Envia o email de redefinição de senha
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      userData.email,
      {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      }
    );

    if (resetError) throw resetError;

    res.json({ message: 'Email de redefinição de senha enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar email de redefinição de senha:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Desativar usuário (soft delete) (apenas para administradores)
 * @access  Private (admin)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Desativa o usuário em vez de excluí-lo (soft delete)
    await supabase.auth.admin.updateUserById(
      id,
      { banned: true }
    );

    res.json({ message: 'Usuário desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
