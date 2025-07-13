import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as ReportsIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  LocalShipping as ShippingIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  DateRange as DateIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Insights as InsightsIcon,
  Analytics as AnalyticsIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material';
import { OrderService, Order } from '../../services/orders';
import { useNotification } from '../shared/Notification';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Componente para exibição de vendas na interface mobile
 */
const MobileSales: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Carregar pedidos do vendedor
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await OrderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      showNotification({ message: 'Erro ao carregar pedidos', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Calcular estatísticas
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

  // Pedidos de hoje
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate.toDateString() === new Date().toDateString();
  });

  // Pedidos desta semana
  const weekOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startOfWeek;
  });

  // Pedidos deste mês
  const monthOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startOfMonth;
  });

  // Valores
  const todayValue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const weekValue = weekOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const monthValue = monthOrders.reduce((sum, order) => sum + order.total_amount, 0);

  // Pedidos por status
  const completedOrders = orders.filter(order => order.status === 'completed');
  const pendingOrders = orders.filter(order => order.status === 'pending');

  // Meta mensal simulada
  const monthlyGoal = 50000;
  const goalProgress = (monthValue / monthlyGoal) * 100;

  // Últimos pedidos
  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'processing': return 'Processando';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      {/* Cabeçalho */}
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Minhas Vendas
      </Typography>

      {/* Resumo do dia */}
      <Card sx={{ mb: 3, bgcolor: '#e8f5e8' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingUpIcon sx={{ color: '#2e7d32', mr: 1 }} />
            <Typography variant="h6" sx={{ color: '#2e7d32' }}>
              Vendas de Hoje
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 1 }}>
            R$ {todayValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {todayOrders.length} pedidos realizados
          </Typography>
        </CardContent>
      </Card>

      {/* Estatísticas da semana e mês */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Esta Semana
              </Typography>
              <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                R$ {weekValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {weekOrders.length} pedidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Este Mês
              </Typography>
              <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                R$ {monthValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {monthOrders.length} pedidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Meta mensal */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StarIcon sx={{ color: '#ff9800', mr: 1 }} />
            <Typography variant="h6">Meta Mensal</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              R$ {monthValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="body2">
              R$ {monthlyGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(goalProgress, 100)} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              '& .MuiLinearProgress-bar': {
                backgroundColor: goalProgress >= 100 ? '#4caf50' : '#ff9800'
              }
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {goalProgress.toFixed(1)}% da meta atingida
          </Typography>
        </CardContent>
      </Card>

      {/* Status dos pedidos */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status dos Pedidos
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                  {completedOrders.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Concluídos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                  {pendingOrders.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pendentes
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Últimos pedidos */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Últimos Pedidos
          </Typography>
          {recentOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Nenhum pedido realizado ainda
              </Typography>
            </Box>
          ) : (
            <List sx={{ px: 0 }}>
              {recentOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            {order.customer?.company_name || 'Cliente não informado'}
                          </Typography>
                          <Chip 
                            label={getStatusText(order.status)} 
                            color={getStatusColor(order.status) as any}
                            size="small" 
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(order.created_at)}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#990000' }}>
                            R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentOrders.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MobileSales; 