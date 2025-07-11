import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  Badge,
  Fab,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import productService, { Product } from '../../services/productService';
import customerService, { Customer } from '../../services/customerService';
import { useNotification } from '../shared/Notification';
import { useAuth } from '../../contexts/AuthContext';

interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}

interface NewOrderProps {
  onBack?: () => void;
  onOrderCreated?: () => void;
}

const steps = ['Cliente', 'Produtos', 'Revisão'];

/**
 * Componente para criação de novos pedidos na interface mobile
 */
const NewOrder: React.FC<NewOrderProps> = ({ onBack, onOrderCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const { showNotification } = useNotification();
  const { user } = useAuth();

  // Carregar dados iniciais
  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAll({ salesperson_id: user?.id });
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showNotification({ message: 'Erro ao carregar clientes', type: 'error' });
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productService.getAll({ activeOnly: true });
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      showNotification({ message: 'Erro ao carregar produtos', type: 'error' });
    }
  };

  // Filtrar produtos
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Adicionar produto ao carrinho
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { 
              ...item, 
              quantity: item.quantity + 1, 
              total: (item.quantity + 1) * item.product.price 
            }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        total: product.price
      }]);
    }
    
    showNotification({ message: `${product.name} adicionado ao carrinho`, type: 'success' });
  };

  // Remover produto do carrinho
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Atualizar quantidade
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { 
            ...item, 
            quantity: newQuantity, 
            total: newQuantity * item.product.price 
          }
        : item
    ));
  };

  // Calcular total do carrinho
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  // Próximo passo
  const handleNext = () => {
    if (activeStep === 0 && !selectedCustomer) {
      showNotification({ message: 'Selecione um cliente', type: 'error' });
      return;
    }
    
    if (activeStep === 1 && cart.length === 0) {
      showNotification({ message: 'Adicione produtos ao carrinho', type: 'error' });
      return;
    }

    setActiveStep(prevStep => prevStep + 1);
  };

  // Passo anterior
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  // Finalizar pedido
  const handleFinishOrder = async () => {
    try {
      setLoading(true);
      
      // Aqui você implementaria a criação do pedido no banco
      // Por enquanto vamos simular
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification({ 
        message: 'Pedido criado com sucesso!', 
        type: 'success' 
      });
      
      onOrderCreated?.();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      showNotification({ message: 'Erro ao criar pedido', type: 'error' });
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
            
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setCustomerDialogOpen(true)}
              sx={{ mb: 2, p: 2, textAlign: 'left' }}
            >
              {selectedCustomer ? (
                <Box>
                  <Typography variant="subtitle1">
                    {selectedCustomer.company_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCustomer.contact_phone}
                  </Typography>
                </Box>
              ) : (
                <Typography>Escolher cliente...</Typography>
              )}
            </Button>

            {selectedCustomer && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Informações do Cliente
                  </Typography>
                  <Typography variant="body2">
                    <strong>Empresa:</strong> {selectedCustomer.company_name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Contato:</strong> {selectedCustomer.contact_name || 'Não informado'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Telefone:</strong> {selectedCustomer.contact_phone}
                  </Typography>
                  {selectedCustomer.address && (
                    <Typography variant="body2">
                      <strong>Endereço:</strong> {selectedCustomer.address}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Adicionar Produtos
              </Typography>
              <Badge badgeContent={cart.length} color="primary">
                <IconButton 
                  onClick={() => setProductDialogOpen(true)}
                  sx={{ bgcolor: '#990000', color: 'white' }}
                >
                  <AddIcon />
                </IconButton>
              </Badge>
            </Box>

            {cart.length === 0 ? (
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
                  {cart.map((item) => (
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
                            onClick={() => removeFromCart(item.product.id)}
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
                        R$ {cartTotal.toFixed(2)}
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
                <Typography variant="body1">{selectedCustomer?.company_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCustomer?.contact_phone}
                </Typography>
              </CardContent>
            </Card>

            {/* Produtos */}
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom sx={{ color: '#990000' }}>
                  Produtos ({cart.length} itens)
                </Typography>
                {cart.map((item) => (
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" sx={{ color: '#990000' }}>
                    R$ {cartTotal.toFixed(2)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Observações */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o pedido..."
            />
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
          Novo Pedido
        </Typography>
      </Box>

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
        borderTop: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Voltar
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleFinishOrder}
              disabled={loading}
              sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
            >
              {loading ? <CircularProgress size={24} /> : 'Finalizar Pedido'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
            >
              Próximo
            </Button>
          )}
        </Box>
      </Box>

      {/* Dialog de seleção de cliente */}
      <Dialog open={customerDialogOpen} onClose={() => setCustomerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Selecionar Cliente</DialogTitle>
        <DialogContent>
          <List>
            {customers.map((customer) => (
              <ListItem 
                key={customer.id} 
                button 
                onClick={() => {
                  setSelectedCustomer(customer);
                  setCustomerDialogOpen(false);
                }}
              >
                <ListItemText
                  primary={customer.company_name}
                  secondary={customer.contact_phone}
                />
              </ListItem>
            ))}
          </List>
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
          <List>
            {filteredProducts.map((product) => (
              <ListItem 
                key={product.id} 
                button 
                onClick={() => {
                  addToCart(product);
                  setProductDialogOpen(false);
                }}
              >
                <ListItemText
                  primary={product.name}
                  secondary={`R$ ${product.price.toFixed(2)} / kg - ${product.category}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewOrder; 