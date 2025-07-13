import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { OrderService, Order } from '../../services/orders';
import { useNotification } from '../shared/Notification';
import { useAuth } from '../../contexts/AuthContext';

const MobileSales: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { user } = useAuth();

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
  const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Minhas Vendas
      </Typography>

      {/* Cards de estatísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                R$ {totalSales.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total em Vendas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CartIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {totalOrders}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pedidos Realizados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <StarIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                R$ {averageOrderValue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ticket Médio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de pedidos */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Últimos Pedidos
          </Typography>
          
          {orders.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Nenhum pedido encontrado
            </Typography>
          ) : (
            <List>
              {orders.slice(0, 10).map((order, index) => (
                <React.Fragment key={order.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {order.customer?.company_name || 'Cliente não informado'}
                          </Typography>
                          <Chip
                            label={order.status}
                            size="small"
                            color={order.status === 'completed' ? 'success' : 'default'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            R$ {order.total_amount.toFixed(2)} • {new Date(order.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < orders.slice(0, 10).length - 1 && <Divider />}
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