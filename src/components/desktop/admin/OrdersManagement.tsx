import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  CircularProgress,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  DateRange as DateIcon
} from '@mui/icons-material';
import { OrderService, Order } from '../../../services/orders';
import { useNotification } from '../../shared/Notification';

/**
 * Componente para gerenciamento completo de pedidos na interface administrativa
 */
const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { showNotification } = useNotification();

  // Carregar pedidos
  const loadOrders = async () => {
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
  };

  useEffect(() => {
    loadOrders();
  }, []);

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

  // Atualizar status do pedido
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setActionLoading(true);
      await OrderService.updateOrderStatus(orderId, newStatus);
      showNotification({ 
        message: `Pedido ${getStatusText(newStatus).toLowerCase()} com sucesso!`, 
        type: 'success' 
      });
      loadOrders();
      setDetailsOpen(false);
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      showNotification({ 
        message: error.message || 'Erro ao atualizar status', 
        type: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Abrir detalhes do pedido
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  // Cancelar pedido
  const handleCancelOrder = async (order: Order) => {
    if (!window.confirm(`Tem certeza que deseja cancelar o pedido #${order.id.substring(0, 8)}?`)) {
      return;
    }
    await updateOrderStatus(order.id, 'cancelled');
  };

  // Estatísticas rápidas
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const totalValue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabeçalho */}
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}>
        Gerenciamento de Pedidos
      </Typography>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Pedidos
              </Typography>
              <Typography variant="h5" component="h2">
                {totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pendentes
              </Typography>
              <Typography variant="h5" component="h2" color="warning.main">
                {pendingOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Em Processo
              </Typography>
              <Typography variant="h5" component="h2" color="info.main">
                {processingOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Valor Total
              </Typography>
              <Typography variant="h5" component="h2" color="success.main">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Buscar por cliente ou ID do pedido..."
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">Todos os status</MenuItem>
                <MenuItem value="pending">Pendente</MenuItem>
                <MenuItem value="processing">Processando</MenuItem>
                <MenuItem value="completed">Concluído</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de pedidos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Valor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nenhum pedido encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      #{order.id.substring(0, 8)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {order.customer?.company_name || 'Cliente não informado'}
                      </Typography>
                      {order.customer?.contact_name && (
                        <Typography variant="body2" color="text.secondary">
                          {order.customer.contact_name}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      R$ {order.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(order.status)} 
                      color={getStatusColor(order.status) as any}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(order.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleViewOrder(order)}
                      sx={{ color: '#990000' }}
                    >
                      <ViewIcon />
                    </IconButton>
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <IconButton
                        onClick={() => handleCancelOrder(order)}
                        sx={{ color: 'error.main' }}
                      >
                        <CancelIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de detalhes do pedido */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Detalhes do Pedido #{selectedOrder?.id.substring(0, 8)}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Informações do cliente */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    Informações do Cliente
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body1">
                          {selectedOrder.customer?.company_name || 'Não informado'}
                        </Typography>
                      </Box>
                      {selectedOrder.customer?.contact_name && (
                        <Typography variant="body2" color="text.secondary">
                          Contato: {selectedOrder.customer.contact_name}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {selectedOrder.customer?.contact_phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {selectedOrder.customer.contact_phone}
                          </Typography>
                        </Box>
                      )}
                      {selectedOrder.customer?.address && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2">
                            📍 {selectedOrder.customer.address}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Informações do pedido */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    Informações do Pedido
                  </Typography>
                  <Grid container spacing={2}>
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
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Última Atualização
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedOrder.updated_at)}
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
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Fechar
          </Button>
          {selectedOrder && selectedOrder.status === 'pending' && (
            <Button
              variant="contained"
              onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
              disabled={actionLoading}
              sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
            >
              Iniciar Processamento
            </Button>
          )}
          {selectedOrder && selectedOrder.status === 'processing' && (
            <Button
              variant="contained"
              onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
              disabled={actionLoading}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#2e7d32' } }}
            >
              Marcar como Concluído
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersManagement; 