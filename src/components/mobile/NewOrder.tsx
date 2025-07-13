import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Avatar,
  Badge,
  Stack,
  Tabs,
  Tab,
  Grid,
  Container,
  Fade,
  Slide,
  Grow,
  Zoom,
  InputAdornment,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  ExpandMore as ExpandMoreIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  Share as ShareIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Error as ErrorIcon,
  HelpOutline as HelpIcon,
  Settings as SettingsIcon,
  Sync as SyncIcon,
  SyncProblem as SyncProblemIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Storage as StorageIcon,
  History as HistoryIcon,
  Update as UpdateIcon,
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import productService, { Product } from '../../services/productService';
import customerService, { Customer } from '../../services/customerService';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../shared/Notification';
import { useAuth } from '../../contexts/AuthContext';

interface NewOrderProps {
  onBack: () => void;
  onOrderCreated?: () => void;
}

const steps = ['Cliente', 'Produtos', 'Revisão'];

/**
 * Componente para criação de novos pedidos na interface mobile
 */
const NewOrder: React.FC<NewOrderProps> = ({ onBack, onOrderCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Usar o contexto do carrinho
  const { 
    state: cartState, 
    addItem, 
    removeItem, 
    updateQuantity, 
    setCustomer, 
    setNotes,
    clearCart 
  } = useCart();

  const loadCustomers = useCallback(async () => {
    try {
      console.log('🔄 Carregando clientes...');
      setLoadingCustomers(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('Usuário não identificado');
      }

      const data = await customerService.getAll({ salesperson_id: user.id });
      console.log('✅ Clientes carregados:', data.length);
      setCustomers(data);
      
      if (data.length === 0) {
        showNotification({ 
          message: 'Nenhum cliente cadastrado para este vendedor', 
          type: 'warning' 
        });
      }
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao carregar clientes: ${errorMessage}`);
      showNotification({ message: 'Erro ao carregar clientes', type: 'error' });
    } finally {
      setLoadingCustomers(false);
    }
  }, [user?.id, showNotification]);

  const loadProducts = useCallback(async () => {
    try {
      console.log('🔄 Carregando produtos...');
      setLoadingProducts(true);
      const data = await productService.getAll({ activeOnly: true });
      console.log('✅ Produtos carregados:', data.length);
      setProducts(data);
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      showNotification({ message: 'Erro ao carregar produtos', type: 'error' });
    } finally {
      setLoadingProducts(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, [loadCustomers, loadProducts]);

  // Se já tiver cliente no carrinho, pula para próximo passo
  useEffect(() => {
    if (cartState.selectedCustomer && activeStep === 0) {
      console.log('✅ Cliente já selecionado, pulando para próximo passo');
      setActiveStep(1);
    }
  }, [cartState.selectedCustomer, activeStep]);

  // Filtrar produtos
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Próximo passo
  const handleNext = () => {
    console.log('🎯 handleNext chamado - activeStep:', activeStep);
    console.log('🎯 Cliente selecionado:', cartState.selectedCustomer?.company_name);
    console.log('🎯 Itens no carrinho:', cartState.items.length);
    
    if (activeStep === 0 && !cartState.selectedCustomer) {
      console.log('❌ Erro: Selecione um cliente');
      showNotification({ message: 'Selecione um cliente', type: 'error' });
      return;
    }
    
    if (activeStep === 1 && cartState.items.length === 0) {
      console.log('❌ Erro: Adicione produtos ao carrinho');
      showNotification({ message: 'Adicione produtos ao carrinho', type: 'error' });
      return;
    }

    const nextStep = activeStep + 1;
    console.log('✅ Avançando para o passo:', nextStep);
    setActiveStep(nextStep);
  };

  // Passo anterior
  const handleBack = () => {
    console.log('⬅️ handleBack chamado - activeStep:', activeStep);
    setActiveStep(prevStep => prevStep - 1);
  };

  // Abrir dialog de cliente
  const handleOpenCustomerDialog = () => {
    console.log('🔄 Abrindo dialog de cliente...');
    console.log('📊 Clientes disponíveis:', customers.length);
    
    if (customers.length === 0) {
      if (loadingCustomers) {
        showNotification({ message: 'Aguarde o carregamento dos clientes', type: 'info' });
      } else {
        showNotification({ message: 'Nenhum cliente disponível', type: 'warning' });
      }
      return;
    }

    setCustomerDialogOpen(true);
  };

  // Selecionar cliente
  const handleSelectCustomer = (customer: Customer) => {
    console.log('✅ Cliente selecionado:', customer.company_name);
    setCustomer(customer);
    setCustomerDialogOpen(false);
    if (activeStep === 0) {
      setActiveStep(1);
    }
  };

  // Finalizar pedido
  const handleFinishOrder = async () => {
    try {
      setLoading(true);
      
      // Validações básicas
      if (!cartState.selectedCustomer) {
        showNotification({ message: 'Cliente não selecionado', type: 'error' });
        return;
      }

      if (cartState.items.length === 0) {
        showNotification({ message: 'Carrinho vazio', type: 'error' });
        return;
      }

      if (!user?.id) {
        showNotification({ message: 'Vendedor não identificado', type: 'error' });
        return;
      }

      // Validar estoque dos produtos
      const stockErrors = cartState.items.filter(item => item.quantity > item.product.stock);
      if (stockErrors.length > 0) {
        const errorProducts = stockErrors.map(item => item.product.name).join(', ');
        showNotification({ 
          message: `Estoque insuficiente para: ${errorProducts}`, 
          type: 'error' 
        });
        return;
      }

      console.log('🚀 Iniciando criação do pedido...');
      
      // Usar a API real de criação de pedidos
      const { OrderService } = await import('../../services/orders');
      
      const order = await OrderService.createOrder(
        cartState.selectedCustomer,
        cartState.items,
        user.id,
        cartState.notes || undefined,
        undefined // payment_method - pode ser implementado depois
      );

      console.log('✅ Pedido criado com sucesso:', order);
      
      showNotification({ 
        message: `Pedido #${order.id.slice(-6)} criado com sucesso!`, 
        type: 'success' 
      });
      
      // Limpar carrinho após sucesso
      clearCart();
      
      onOrderCreated?.();
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      
      // Tratar diferentes tipos de erro
      let errorMessage = 'Erro desconhecido ao criar pedido';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showNotification({ 
        message: `Erro ao criar pedido: ${errorMessage}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar conteúdo por passo
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Selecionar Cliente
            </Typography>
            
            {/* Erro na tela */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
                <Button 
                  size="small" 
                  onClick={() => {
                    setError(null);
                    loadCustomers();
                  }}
                  sx={{ ml: 2 }}
                >
                  <RefreshIcon sx={{ mr: 1 }} />
                  Tentar novamente
                </Button>
              </Alert>
            )}

            {/* Cliente selecionado */}
            {cartState.selectedCustomer ? (
              <Card sx={{ mb: 2, border: '2px solid #4caf50' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {cartState.selectedCustomer.company_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cartState.selectedCustomer.contact_phone}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cartState.selectedCustomer.address}
                      </Typography>
                    </Box>
                    <IconButton 
                      onClick={handleOpenCustomerDialog}
                      sx={{ color: '#4caf50' }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleOpenCustomerDialog}
                sx={{ mb: 2, p: 2, textAlign: 'left' }}
                disabled={loadingCustomers}
              >
                {loadingCustomers ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <Typography>Carregando clientes...</Typography>
                  </Box>
                ) : (
                  <Typography>Escolher cliente...</Typography>
                )}
              </Button>
            )}

            {/* Status dos clientes */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {loadingCustomers ? 'Carregando...' : `${customers.length} clientes disponíveis`}
              </Typography>
              
              {!loadingCustomers && (
                <Button 
                  size="small" 
                  onClick={loadCustomers}
                  startIcon={<RefreshIcon />}
                >
                  Atualizar
                </Button>
              )}
            </Box>

            {/* Skeleton loading */}
            {loadingCustomers && (
              <Box sx={{ mt: 2 }}>
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" width="100%" height={60} />
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Produtos no Carrinho
              </Typography>
              <Badge badgeContent={cartState.items.length} color="primary">
                <IconButton 
                  onClick={() => setProductDialogOpen(true)}
                  sx={{ bgcolor: '#990000', color: 'white' }}
                >
                  <AddIcon />
                </IconButton>
              </Badge>
            </Box>

            {/* Botão de teste para ir para revisão */}
            {cartState.items.length > 0 && (
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  console.log('🎯 Botão teste clicado - indo para revisão!');
                  handleNext();
                }}
                sx={{ 
                  mb: 2,
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#388e3c' },
                  py: 1.5
                }}
              >
                🚀 IR PARA REVISÃO ({cartState.items.length} itens)
              </Button>
            )}

            {cartState.items.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Carrinho vazio
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => setProductDialogOpen(true)}
                    sx={{ mt: 2, bgcolor: '#990000' }}
                  >
                    Adicionar Produtos
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <List>
                  {cartState.items.map((item) => (
                    <Card key={item.product.id} sx={{ mb: 1 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {item.product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              R$ {item.product.price.toFixed(2)} / kg
                            </Typography>
                          </Box>
                          <IconButton 
                            onClick={() => removeItem(item.product.id)}
                            size="small"
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton 
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              size="small"
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography sx={{ mx: 2, minWidth: '3ch', textAlign: 'center' }}>
                              {item.quantity}kg
                            </Typography>
                            <IconButton 
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              size="small"
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                          <Typography variant="h6" sx={{ color: '#990000' }}>
                            R$ {item.total.toFixed(2)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </List>

                <Card sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h5" sx={{ color: '#990000', fontWeight: 'bold' }}>
                        R$ {cartState.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Revisar Pedido
            </Typography>

            {/* Cliente */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#990000' }}>
                  Cliente
                </Typography>
                <Typography variant="body1">{cartState.selectedCustomer?.company_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {cartState.selectedCustomer?.contact_phone}
                </Typography>
              </CardContent>
            </Card>

            {/* Produtos */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#990000' }}>
                  Produtos ({cartState.items.length} itens)
                </Typography>
                {cartState.items.map((item) => (
                  <Box key={item.product.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Box>
                      <Typography variant="body2">{item.product.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.quantity}kg × R$ {item.product.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      R$ {item.total.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" sx={{ color: '#990000', fontWeight: 'bold' }}>
                    R$ {cartState.total.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Observações */}
            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#990000' }}>
                  Observações
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={cartState.notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações sobre o pedido..."
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 2, pb: 8 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={onBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          {cartState.items.length > 0 ? 'Continuar Pedido' : 'Novo Pedido'}
        </Typography>
      </Box>

      {/* Indicador de progresso do carrinho */}
      {cartState.items.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              {cartState.items.length} itens no carrinho
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              R$ {cartState.total.toFixed(2)}
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress size={60} sx={{ color: '#4caf50' }} />
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
            Criando pedido...
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', opacity: 0.8, textAlign: 'center' }}>
            Aguarde enquanto processamos seu pedido
          </Typography>
        </Box>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Conteúdo */}
      {renderStepContent()}

      {/* Botões de navegação */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        p: 2, 
        bgcolor: 'white',
        borderTop: '1px solid #e0e0e0',
        zIndex: 1100,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ 
              minWidth: '80px',
              height: '44px',
              '&:disabled': { 
                opacity: 0.5 
              }
            }}
          >
            Voltar
          </Button>
          
          {/* Indicador de progresso */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {activeStep + 1} de {steps.length}
            </Typography>
          </Box>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleFinishOrder}
              disabled={loading}
              sx={{ 
                bgcolor: '#990000', 
                '&:hover': { bgcolor: '#660000' },
                minWidth: '120px',
                height: '44px'
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  <Typography variant="body2">Criando...</Typography>
                </Box>
              ) : (
                'Finalizar Pedido'
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => {
                console.log('🎯 Botão Próximo clicado!');
                handleNext();
              }}
              sx={{ 
                bgcolor: '#990000', 
                '&:hover': { bgcolor: '#660000' },
                minWidth: '100px',
                height: '44px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Próximo
            </Button>
          )}
        </Box>
      </Box>

      {/* Dialog de seleção de cliente */}
      <Dialog open={customerDialogOpen} onClose={() => setCustomerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Selecionar Cliente</Typography>
            <Typography variant="body2" color="text.secondary">
              {customers.length} clientes
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {customers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <WarningIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Nenhum cliente cadastrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entre em contato com o administrador para cadastrar clientes
              </Typography>
            </Box>
          ) : (
            <List>
              {customers.map((customer) => (
                <ListItem 
                  key={customer.id} 
                  button 
                  onClick={() => handleSelectCustomer(customer)}
                  sx={{ 
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {customer.company_name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          📞 {customer.contact_phone}
                        </Typography>
                        {customer.address && (
                          <Typography variant="body2" color="text.secondary">
                            📍 {customer.address}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de seleção de produtos */}
      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Produtos</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {loadingProducts ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                Carregando produtos...
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredProducts.map((product) => (
                <ListItem 
                  key={product.id} 
                  button 
                  onClick={() => {
                    addItem(product);
                    setProductDialogOpen(false);
                  }}
                  sx={{ 
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {product.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: '#990000', fontWeight: 'bold' }}>
                          R$ {product.price.toFixed(2)} / kg
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.category} • Estoque: {product.stock}kg
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewOrder; 