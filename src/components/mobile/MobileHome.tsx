import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
  Avatar,
  Badge,
  Stack,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  ShoppingCart as CartIcon,
  Business as BusinessIcon,
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Work as WorkIcon,
  NotificationsActive as NotificationsIcon,
  TrendingDown as TrendingDownIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { OrderService } from '../../services/orders';

interface MobileHomeProps {
  onNewOrder?: () => void;
}

const MobileHome: React.FC<MobileHomeProps> = ({ onNewOrder }) => {
  const { user } = useAuth();
  const { state: cartState } = useCart();

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Olá, {user?.name || 'Vendedor'}! 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bem-vindo ao sistema Vale do Boi
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {user?.name?.charAt(0) || 'V'}
        </Avatar>
      </Box>

      {/* Action Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card 
            sx={{ 
              cursor: 'pointer', 
              '&:hover': { boxShadow: 4 },
              bgcolor: 'primary.main',
              color: 'white'
            }}
            onClick={onNewOrder}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <AddIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Novo Pedido
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={6}>
          <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Badge badgeContent={cartState.itemCount} color="error">
                <CartIcon sx={{ fontSize: 48, mb: 1, color: 'success.main' }} />
              </Badge>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Carrinho
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Stats */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Vendas do Mês
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                R$ 45.280,00
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +12% vs mês anterior
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShippingIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Pedidos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                23
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Este mês
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FAB for New Order */}
      {onNewOrder && (
        <Fab
          color="primary"
          onClick={onNewOrder}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default MobileHome;
