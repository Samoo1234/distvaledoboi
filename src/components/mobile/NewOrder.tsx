import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  InputAdornment,
  Skeleton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../shared/Notification';
import { useAuth } from '../../contexts/AuthContext';
import customerService, { Customer } from '../../services/customerService';
import productService, { Product } from '../../services/productService';
import { OrderService } from '../../services/orders';

const steps = ['Cliente', 'Produtos', 'Revisão'];

const NewOrder: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { state: cartState, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const { showNotification } = useNotification();
  const { user } = useAuth();

  const loadCustomers = useCallback(async () => {
    try {
      const data = await customerService.getAll({ activeOnly: true });
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      showNotification({ message: 'Erro ao carregar clientes', type: 'error' });
    }
  }, [showNotification]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await productService.getAll({ activeOnly: true });
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      showNotification({ message: 'Erro ao carregar produtos', type: 'error' });
    }
  }, [showNotification]);

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, [loadCustomers, loadProducts]);

  const handleNext = () => {
    if (activeStep === 0 && !selectedCustomer) {
      showNotification({ message: 'Selecione um cliente para continuar', type: 'warning' });
      return;
    }
    
    if (activeStep === 1 && cartState.itemCount === 0) {
      showNotification({ message: 'Adicione pelo menos um produto ao pedido', type: 'warning' });
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinish = async () => {
    if (!selectedCustomer) {
      showNotification({ message: 'Cliente não selecionado', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      
      await OrderService.createOrder(
        selectedCustomer,
        cartState.items,
        user?.id || '',
        '' // notes
      );
      
      clearCart();
      showNotification({ message: 'Pedido criado com sucesso!', type: 'success' });
      navigate('/mobile');
      
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      showNotification({ message: 'Erro ao criar pedido', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Selecionar Cliente
            </Typography>
            
            <TextField
              fullWidth
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {loading ? (
              <Box>
                <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={60} />
              </Box>
            ) : (
              <List>
                {filteredCustomers.map((customer) => (
                  <ListItem
                    key={customer.id}
                    button
                    selected={selectedCustomer?.id === customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText'
                      }
                    }}
                  >
                    <ListItemText
                      primary={customer.company_name}
                      secondary={`${customer.contact_name} • ${customer.contact_phone}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Produtos no Carrinho
            </Typography>
            
            {cartState.itemCount === 0 ? (
              <Alert severity="info">
                Nenhum produto adicionado. Navegue para a lista de produtos para adicionar itens.
              </Alert>
            ) : (
              <List>
                {cartState.items.map((item) => (
                  <ListItem key={item.product.id} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, mb: 1 }}>
                    <ListItemText
                      primary={item.product.name}
                      secondary={`R$ ${item.product.price.toFixed(2)} x ${item.quantity} = R$ ${item.total.toFixed(2)}`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <RemoveIcon />
                      </Button>
                      <Typography>{item.quantity}</Typography>
                      <Button
                        size="small"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <AddIcon />
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <DeleteIcon />
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
            
            <Typography variant="h6" sx={{ mt: 2, textAlign: 'right' }}>
              Total: R$ {cartState.total.toFixed(2)}
            </Typography>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Revisão do Pedido
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Cliente
                </Typography>
                <Typography>{selectedCustomer?.company_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCustomer?.contact_name} • {selectedCustomer?.contact_phone}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Produtos ({cartState.itemCount} {cartState.itemCount === 1 ? 'item' : 'itens'})
                </Typography>
                {cartState.items.map((item) => (
                  <Box key={item.product.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      <Typography>{item.product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} x R$ {item.product.price.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 'bold' }}>
                      R$ {item.total.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ borderTop: '1px solid #e0e0e0', pt: 1, mt: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      R$ {cartState.total.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/mobile')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Novo Pedido
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Voltar
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleFinish}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Finalizando...' : 'Finalizar Pedido'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Próximo
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default NewOrder; 