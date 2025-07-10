import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  InputAdornment, 
  IconButton,
  CircularProgress 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/shared/Notification';
import { useDevice } from '../hooks/useDevice';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, user, isAuthenticated } = useAuth();
  const { deviceType } = useDevice();
  const { showNotification } = useNotification();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccessful, setLoginSuccessful] = useState(false);

  // Efeito para redirecionar após login bem-sucedido quando user for carregado
  useEffect(() => {
    console.log('🔄 Login useEffect triggered:', { loginSuccessful, isAuthenticated, user });
    
    if (loginSuccessful && isAuthenticated && user) {
      console.log('✅ Redirecionando usuário:', user.role);
      
      // Redireciona baseado no role do usuário
      if (user.role === 'vendedor') {
        console.log('📱 Redirecionando para /mobile');
        navigate('/mobile');
      } else if (user.role === 'separacao') {
        console.log('🖥️ Redirecionando para /separacao');
        navigate('/separacao');
      } else if (user.role === 'admin') {
        console.log('👑 Redirecionando para /admin');
        navigate('/admin');
      } else {
        // Fallback para role desconhecido
        console.log('❓ Role desconhecido, redirecionando para /mobile');
        navigate('/mobile');
      }
      setLoginSuccessful(false); // Reset do flag
    }
  }, [loginSuccessful, isAuthenticated, user, navigate]);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔑 Iniciando processo de login...');
    console.log('Email:', email);
    console.log('Password length:', password.length);
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      showNotification({ message: 'Por favor, preencha todos os campos', type: 'error' });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Chamando signIn...');
      const result = await signIn({ email, password });
      
      console.log('📨 Resultado do signIn:', result);
      
      if (result.error) {
        console.log('❌ Erro no signIn:', result.error);
        throw new Error(result.error.message || 'Erro ao fazer login');
      }
      
      console.log('✅ SignIn bem-sucedido!');
      console.log('User data from signIn:', result.data?.user);
      
      showNotification({ message: 'Login realizado com sucesso!', type: 'success' });
      
      // Marca que o login foi bem-sucedido - o redirecionamento acontecerá no useEffect
      console.log('🏁 Marcando login como bem-sucedido');
      setLoginSuccessful(true);
      
    } catch (err: any) {
      console.log('💥 Erro capturado no login:', err);
      const errorMessage = err.message || 'Falha na autenticação. Verifique suas credenciais.';
      setError(errorMessage);
      showNotification({ message: errorMessage, type: 'error' });
    } finally {
      console.log('🏁 Finalizando processo de login');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2,
        bgcolor: '#ffffff',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4
        }}
      >
        {/* Logo ou texto do título */}
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#990000', 
            textAlign: 'center',
            mb: 2
          }}
        >
          Distribuidora de Carnes Vale do Boi
        </Typography>
        <Typography 
          variant="subtitle1"
          sx={{ color: '#666666', textAlign: 'center' }}
        >
          Sistema de gestão integrado
        </Typography>
      </Box>

      <Card 
        sx={{ 
          maxWidth: 400, 
          width: '100%', 
          boxShadow: 3,
          borderRadius: 2,
          border: '1px solid #dddddd'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              mb: 3, 
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#333333'
            }}
          >
            Acesso ao Sistema
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleLogin}>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              variant="outlined"
              required
              autoComplete="email"
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              variant="outlined"
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ 
                py: 1.5,
                bgcolor: '#990000',
                '&:hover': {
                  bgcolor: '#660000',
                },
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Entrar'
              )}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Problemas para acessar? Contate o administrador.
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Distribuidora de Carnes Vale do Boi
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Todos os direitos reservados
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
