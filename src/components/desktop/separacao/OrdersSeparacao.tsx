import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  Done as CompleteIcon,
  PlayArrow as StartIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import { OrderService, Order } from '../../../services/orders';
import { useNotification } from '../../shared/Notification';

/**
 * Componente para gestão de pedidos da equipe de separação
 */
const OrdersSeparacao: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { showNotification } = useNotification();

  // Carregar pedidos para separação
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await OrderService.getOrdersForSeparation();
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

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Separar pedidos por status
  const pendingOrders = filteredOrders.filter(order => order.status === 'pending');
  const processingOrders = filteredOrders.filter(order => order.status === 'processing');
  const completedOrders = filteredOrders.filter(order => order.status === 'completed');

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
      case 'pending': return 'Aguardando Separação';
      case 'processing': return 'Em Separação';
      case 'completed': return 'Separado';
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Iniciar separação
  const handleStartSeparation = async (order: Order) => {
    try {
      setActionLoading(true);
      await OrderService.startSeparation(order.id);
      showNotification({ 
        message: 'Separação iniciada com sucesso!', 
        type: 'success' 
      });
      loadOrders();
      setDetailsOpen(false);
    } catch (error: any) {
      console.error('Erro ao iniciar separação:', error);
      showNotification({ 
        message: error.message || 'Erro ao iniciar separação', 
        type: 'error' 
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Completar separação
  const handleCompleteSeparation = async (order: Order) => {
    try {
      setActionLoading(true);
      await OrderService.completeSeparation(order.id);
      showNotification({ 
        message: 'Separação concluída com sucesso!', 
        type: 'success' 
      });
      loadOrders();
      setDetailsOpen(false);
    } catch (error: any) {
      console.error('Erro ao completar separação:', error);
      showNotification({ 
        message: error.message || 'Erro ao completar separação', 
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
        Separação de Pedidos
      </Typography>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ color: '#e65100', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Aguardando
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ color: '#e65100' }}>
                    {pendingOrders.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ color: '#1976d2', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Em Separação
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ color: '#1976d2' }}>
                    {processingOrders.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: '#e8f5e8' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CompleteIcon sx={{ color: '#2e7d32', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Separados
                  </Typography>
                  <Typography variant="h5" component="h2" sx={{ color: '#2e7d32' }}>
                    {completedOrders.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Instruções para a equipe */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Workflow de Separação:</strong> 
          1. Visualize os pedidos pendentes, 
          2. Inicie a separação clicando no botão "Iniciar", 
          3. Após separar todos os itens, marque como "Concluído"
        </Typography>
      </Alert>

      {/* Busca */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
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
        </CardContent>
      </Card>

      {/* Tabela de pedidos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Pedido</TableCell>
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
                <TableRow 
                  key={order.id} 
                  sx={{ 
                    '&:hover': { bgcolor: '#f9f9f9' },
                    bgcolor: order.status === 'processing' ? '#fff3e0' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
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
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#990000' }}>
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
                    {order.status === 'pending' && (
                      <IconButton
                        onClick={() => handleStartSeparation(order)}
                        sx={{ color: '#1976d2' }}
                        title="Iniciar Separação"
                      >
                        <StartIcon />
                      </IconButton>
                    )}
                    {order.status === 'processing' && (
                      <IconButton
                        onClick={() => handleCompleteSeparation(order)}
                        sx={{ color: '#2e7d32' }}
                        title="Concluir Separação"
                      >
                        <CompleteIcon />
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 1, color: '#990000' }} />
            Separação do Pedido #{selectedOrder?.id.substring(0, 8)}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              {/* Status atual */}
              <Alert 
                severity={selectedOrder.status === 'pending' ? 'warning' : selectedOrder.status === 'processing' ? 'info' : 'success'}
                sx={{ mb: 3 }}
              >
                <Typography variant="body1">
                  <strong>Status:</strong> {getStatusText(selectedOrder.status)}
                </Typography>
              </Alert>

              {/* Informações do cliente */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    Informações do Cliente
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="h6">
                          {selectedOrder.customer?.company_name || 'Não informado'}
                        </Typography>
                      </Box>
                      {selectedOrder.customer?.contact_name && (
                        <Typography variant="body2" color="text.secondary">
                          Contato: {selectedOrder.customer.contact_name}
                        </Typography>
                      )}
                      {selectedOrder.customer?.address && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          📍 {selectedOrder.customer.address}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      {selectedOrder.customer?.contact_phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {selectedOrder.customer.contact_phone}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Informações do pedido */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#990000' }}>
                    Detalhes do Pedido
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Valor Total
                      </Typography>
                      <Typography variant="h5" sx={{ color: '#990000', fontWeight: 'bold' }}>
                        R$ {selectedOrder.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Data do Pedido
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
              onClick={() => handleStartSeparation(selectedOrder)}
              disabled={actionLoading}
              startIcon={<StartIcon />}
              sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#0d47a1' } }}
            >
              Iniciar Separação
            </Button>
          )}
          {selectedOrder && selectedOrder.status === 'processing' && (
            <Button
              variant="contained"
              onClick={() => handleCompleteSeparation(selectedOrder)}
              disabled={actionLoading}
              startIcon={<CompleteIcon />}
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
            >
              Concluir Separação
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersSeparacao; 