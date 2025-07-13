import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { OrderService, Order } from '../../services/orders';
import { useNotification } from '../shared/Notification';
import { useAuth } from '../../contexts/AuthContext';

interface OrdersListProps {
  onNewOrder?: () => void;
}

/**
 * Componente para listagem de pedidos na interface mobile
 */
const OrdersList: React.FC<OrdersListProps> = ({ onNewOrder }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true); // Mudado para true - carrega automaticamente
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Carregar pedidos
  const loadOrders = useCallback(async () => {
    try {
      console.log('🔄 OrdersList: Carregando pedidos...');
      console.log('👤 User ID:', user?.id);
      
      setLoading(true);
      
      if (!user?.id) {
        console.log('❌ Usuário não identificado');
        showNotification({ message: 'Usuário não identificado', type: 'warning' });
        return;
      }

      const data = await OrderService.getOrders({
        salesperson_id: user.id
      });
      
      console.log('✅ Pedidos carregados:', data.length);
      setOrders(data);
      
      if (data.length === 0) {
        console.log('ℹ️ Nenhum pedido encontrado para este vendedor');
      }
      
    } catch (error) {
      console.error('❌ Erro detalhado ao carregar pedidos:', error);
      
      let errorMessage = 'Erro ao carregar pedidos';
      
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        errorMessage = `Erro: ${error.message}`;
      }
      
      showNotification({ message: errorMessage, type: 'error' });
      
    } finally {
      setLoading(false);
    }
  }, [user?.id, showNotification]);

  // Carregar pedidos automaticamente
  useEffect(() => {
    if (user?.id) {
      loadOrders();
    }
  }, [user?.id, loadOrders]);

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Abrir detalhes do pedido
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  // Estatísticas rápidas
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalValue = orders.reduce((sum, o) => sum + o.total_amount, 0);

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
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Meus Pedidos
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={loadOrders}
              disabled={loading}
              sx={{ bgcolor: '#f5f5f5' }}
            >
              {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
            {onNewOrder && (
              <IconButton 
                onClick={onNewOrder}
                sx={{ bgcolor: '#990000', color: 'white' }}
              >
                <AddIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Cards de estatísticas */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary">
                  Pendentes
                </Typography>
                <Typography variant="h6" sx={{ color: '#e65100' }}>
                  {pendingOrders}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: '#e8f5e8' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary">
                  Valor Total
                </Typography>
                <Typography variant="h6" sx={{ color: '#2e7d32' }}>
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por cliente ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pending">Pendente</MenuItem>
                  <MenuItem value="processing">Processando</MenuItem>
                  <MenuItem value="completed">Concluído</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista de pedidos */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <MoneyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {loading ? 'Carregando pedidos...' : 'Nenhum pedido encontrado'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {loading 
                ? 'Aguarde enquanto carregamos seus pedidos'
                : searchTerm || statusFilter 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Clique no botão + para criar seu primeiro pedido'
              }
            </Typography>
            {!loading && onNewOrder && (
              <Button 
                variant="contained" 
                onClick={onNewOrder}
                sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
              >
                Criar Primeiro Pedido
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ px: 0 }}>
          {filteredOrders.map((order) => (
            <Card key={order.id} sx={{ mb: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {order.customer?.company_name || 'Cliente não informado'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pedido #{order.id.substring(0, 8)}
                    </Typography>
                  </Box>
                  <Chip 
                    label={getStatusText(order.status)} 
                    color={getStatusColor(order.status) as any}
                    size="small" 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#990000', fontWeight: 'bold' }}>
                      R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(order.created_at)}
                    </Typography>
                  </Box>
                  <IconButton 
                    onClick={() => handleViewOrder(order)}
                    sx={{ color: '#990000' }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Dialog de detalhes do pedido */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Detalhes do Pedido
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedOrder.customer?.company_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pedido #{selectedOrder.id.substring(0, 8)}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Status: <Chip 
                  label={getStatusText(selectedOrder.status)} 
                  color={getStatusColor(selectedOrder.status) as any}
                  size="small" 
                />
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Valor Total: R$ {selectedOrder.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Data: {formatDate(selectedOrder.created_at)}
              </Typography>
              
              {selectedOrder.notes && (
                <>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Observações:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrder.notes}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersList; 