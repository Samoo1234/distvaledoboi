const { createClient } = require('@supabase/supabase-js');

// Inicializando o cliente Supabase com as variáveis de ambiente
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Middleware para autenticar o usuário através do token JWT
 * Verifica se o token é válido e adiciona o usuário ao objeto req
 */
const authenticate = async (req, res, next) => {
  try {
    // Extraindo o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Acesso não autorizado. Token não fornecido ou formato inválido.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificando o token com o Supabase
    const { data: user, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Acesso não autorizado. Token inválido ou expirado.' 
      });
    }
    
    // Adicionando o usuário autenticado ao objeto req
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro interno no servidor durante a autenticação.' 
    });
  }
};

/**
 * Middleware para verificar se o usuário tem o perfil necessário
 * @param {string|string[]} roles - Perfil ou array de perfis permitidos
 */
const authorize = (roles) => {
  return async (req, res, next) => {
    try {
      // Verificando se o usuário está autenticado
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Acesso não autorizado. Usuário não autenticado.' 
        });
      }
      
      // Buscando o perfil do usuário na tabela user_profiles
      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select('role, name, avatar_url, active')
        .eq('id', req.user.id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return res.status(403).json({ 
          error: 'Acesso negado. Erro ao buscar perfil de usuário.' 
        });
      }
      
      // Se o perfil não existir, criar um perfil padrão com role 'vendedor'
      if (!userData) {
        // Busca informações básicas do usuário
        const { data: authUser } = await supabase.auth.getUser(req.user.token);
        const email = authUser?.user?.email || 'Sem email';
        const name = email.split('@')[0] || 'Usuário';
        
        // Cria um perfil padrão
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([
            { 
              id: req.user.id, 
              role: 'vendedor', // Perfil padrão
              name: name,
              active: true
            }
          ])
          .select()
          .single();
        
        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          return res.status(500).json({
            error: 'Erro ao criar perfil de usuário.'
          });
        }
        
        userData = newProfile;
      }
      
      // Verificar se o usuário está ativo
      if (!userData.active) {
        return res.status(403).json({
          error: 'Conta desativada. Entre em contato com o administrador.'
        });
      }
      
      // Convertendo roles para array se for uma string
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Verificando se o usuário tem o perfil necessário
      if (!allowedRoles.includes(userData.role)) {
        return res.status(403).json({ 
          error: `Acesso negado. Permissão insuficiente para esta operação. Perfil necessário: ${allowedRoles.join(' ou ')}.` 
        });
      }
      
      // Adicionando o perfil do usuário ao objeto req
      req.user.role = userData.role;
      
      next();
    } catch (error) {
      console.error('Erro de autorização:', error);
      return res.status(500).json({ 
        error: 'Erro interno no servidor durante a autorização.' 
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize
};
