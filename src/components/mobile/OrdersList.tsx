import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Badge,
  Divider,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  DateRange as CalendarIcon,
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
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Carregar pedidos
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await OrderService.getOrders({
        salesperson_id: user?.id
      });
      setOrders(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      showNotification({ message: 'Erro ao carregar pedidos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

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
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Meus Pedidos
        </Typography>
        
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
              Nenhum pedido encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm || statusFilter 
                ? 'Tente ajustar os filtros de busca'
                : 'Que tal criar seu primeiro pedido?'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List sx={{ px: 0 }}>
          {filteredOrders.map((order, index) => (
            <React.Fragment key={order.id}>
              <Card sx={{ mb: 1 }}>
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
                      <ViewIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Botão flutuante para novo pedido */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ 
          position: 'fixed', 
          bottom: 80, 
          right: 16,
          bgcolor: '#990000',
          '&:hover': { bgcolor: '#660000' }
        }}
        onClick={onNewOrder}
      >
        <AddIcon />
      </Fab>

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
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    ID do Pedido
                  </Typography>
                  <Typography variant="body1">
                    #{selectedOrder.id.substring(0, 8)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={getStatusText(selectedOrder.status)} 
                    color={getStatusColor(selectedOrder.status) as any}
                    size="small" 
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#990000' }}>
                    R$ {selectedOrder.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Data de Criação
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedOrder.created_at)}
                  </Typography>
                </Grid>
              </Grid>

              {selectedOrder.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Observações
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.notes}
                  </Typography>
                </Box>
              )}

              {selectedOrder.customer?.contact_phone && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    startIcon={<PhoneIcon />}
                    href={`tel:${selectedOrder.customer.contact_phone}`}
                    sx={{ color: '#990000' }}
                  >
                    Ligar para o cliente
                  </Button>
                </Box>
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