import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Avatar,
  Stack,
  Grid,
  Container,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ShoppingCart as CartIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalOffer as LocalOfferIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Done as DoneIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Label as LabelIcon,
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  Update as UpdateIcon,
  Sync as SyncIcon,
  SyncProblem as SyncProblemIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Storage as StorageIcon,
  History as HistoryIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingFlat as TrendingFlatIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Insights as InsightsIcon,
  Dashboard as DashboardIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import productService, { Product } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../shared/Notification';

/**
 * Lista de produtos para interface mobile (vendedores)
 */
const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAddedSnackbar, setShowAddedSnackbar] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState<string>('');
  
  const { state: cartState, addItem, getItemQuantity, hasItem } = useCart();
  const { showNotification } = useNotification();

  // Carregar produtos e categorias
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll({ activeOnly: true });
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const filterProducts = useCallback(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1); // Quantidade padrão: 1kg
    setLastAddedProduct(product.name);
    setShowAddedSnackbar(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Carcaças Bovinas': '#d32f2f',
      'Carcaças Suínas': '#f57c00',
      'Peças Bovinas': '#c62828',
      'Peças Suínas': '#ef6c00',
      'Miúdos Bovinos': '#7b1fa2',
      'Miúdos Suínos': '#5e35b1'
    };
    return colors[category] || '#666666';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={loadProducts}
          sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#7d0000' } }}
        >
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Barra de busca */}
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

      {/* Filtros de categoria */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Categorias
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label="Todos"
            onClick={() => setSelectedCategory('')}
            variant={selectedCategory === '' ? 'filled' : 'outlined'}
            sx={{ 
              bgcolor: selectedCategory === '' ? '#990000' : 'transparent',
              color: selectedCategory === '' ? 'white' : '#990000',
              borderColor: '#990000'
            }}
          />
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
              sx={{ 
                bgcolor: selectedCategory === category ? getCategoryColor(category) : 'transparent',
                color: selectedCategory === category ? 'white' : getCategoryColor(category),
                borderColor: getCategoryColor(category)
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Lista de produtos */}
      <Grid container spacing={2}>
        {filteredProducts.map((product) => {
          const quantityInCart = getItemQuantity(product.id);
          const isInCart = hasItem(product.id);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card 
                sx={{ 
                  borderRadius: 2,
                  height: '100%',
                  border: isInCart ? '2px solid #4caf50' : '1px solid #e0e0e0',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                    transition: 'all 0.2s'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                      {product.name}
                    </Typography>
                    {isInCart && (
                      <Chip
                        icon={<CheckIcon />}
                        label={`${quantityInCart}kg`}
                        size="small"
                        color="success"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.description}
                  </Typography>
                  
                  <Chip
                    label={product.category}
                    size="small"
                    sx={{
                      bgcolor: getCategoryColor(product.category),
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 2
                    }}
                  />
                  
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#990000', mb: 1 }}>
                    {formatPrice(product.price)}
                    <Typography component="span" variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                      /kg
                    </Typography>
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        SKU: {product.sku} • Estoque: {product.stock}kg
                      </Typography>
                    </Box>
                    <Button
                      variant={isInCart ? "outlined" : "contained"}
                      size="small"
                      startIcon={isInCart ? <AddIcon /> : <AddIcon />}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      sx={{
                        bgcolor: isInCart ? 'transparent' : '#990000',
                        color: isInCart ? '#4caf50' : 'white',
                        borderColor: isInCart ? '#4caf50' : '#990000',
                        '&:hover': { 
                          bgcolor: isInCart ? '#e8f5e8' : '#7d0000',
                          borderColor: isInCart ? '#4caf50' : '#7d0000'
                        },
                        borderRadius: 2,
                        fontWeight: 'bold'
                      }}
                    >
                      {isInCart ? 'Adicionar +' : 'Adicionar'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Mensagem quando não há produtos */}
      {filteredProducts.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {searchTerm || selectedCategory 
              ? 'Nenhum produto encontrado com os filtros aplicados.'
              : 'Nenhum produto disponível no momento.'
            }
          </Typography>
        </Box>
      )}

      {/* Botão flutuante do carrinho */}
      {cartState.itemCount > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            bgcolor: '#4caf50',
            '&:hover': { bgcolor: '#388e3c' }
          }}
        >
          <Badge badgeContent={cartState.itemCount} color="error">
            <CartIcon />
          </Badge>
        </Fab>
      )}

      {/* Snackbar para feedback de adição */}
      <Snackbar
        open={showAddedSnackbar}
        autoHideDuration={2000}
        onClose={() => setShowAddedSnackbar(false)}
        message={`${lastAddedProduct} adicionado ao carrinho!`}
        sx={{ 
          '& .MuiSnackbarContent-root': {
            bgcolor: '#4caf50',
            color: 'white'
          }
        }}
      />
    </Box>
  );
};

export default ProductsList; 