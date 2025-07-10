import React, { useState } from 'react';
import { 
  Box, 
  BottomNavigation, 
  BottomNavigationAction, 
  Paper, 
  Typography, 
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Avatar
} from '@mui/material';
import {
  Home as HomeIcon,
  ShoppingCart as CartIcon,
  Person as ClientIcon,
  Assessment as SalesIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useOffline } from '../../hooks/useOffline';
import MobileHome from './MobileHome';
import LoadingScreen from '../shared/LoadingScreen';

/**
 * Layout principal para interface mobile (vendedores)
 */
const MobileLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const { isOnline } = useOffline();
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return <LoadingScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <MobileHome />;
      case 1:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6">Pedidos</Typography>
            <Typography>
              Aqui será implementada a tela de pedidos.
            </Typography>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6">Clientes</Typography>
            <Typography>
              Aqui será implementada a tela de clientes.
            </Typography>
          </Box>
        );
      case 3:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6">Vendas</Typography>
            <Typography>
              Aqui será implementada a tela de vendas.
            </Typography>
          </Box>
        );
      default:
        return <MobileHome />;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      bgcolor: '#ffffff'
    }}>
      {/* App Bar */}
      <AppBar position="static" sx={{ bgcolor: '#990000' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ flexGrow: 1 }}
          >
            Vale do Boi
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isOnline && (
              <Typography 
                variant="caption" 
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white', 
                  px: 1, 
                  py: 0.5, 
                  borderRadius: 1,
                  mr: 1
                }}
              >
                Offline
              </Typography>
            )}
            
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <Avatar 
              sx={{ 
                ml: 1, 
                width: 32, 
                height: 32,
                bgcolor: '#FFFFFF',
                color: '#990000'
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Conteúdo Principal */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        pb: 7 // Espaço para a navegação inferior
      }}>
        {renderContent()}
      </Box>

      {/* Navegação Inferior */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: 2
        }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .Mui-selected': {
              color: '#990000'
            }
          }}
        >
          <BottomNavigationAction label="Início" icon={<HomeIcon />} />
          <BottomNavigationAction label="Pedidos" icon={<CartIcon />} />
          <BottomNavigationAction label="Clientes" icon={<ClientIcon />} />
          <BottomNavigationAction label="Vendas" icon={<SalesIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MobileLayout;
