import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Badge,
  Fab,
  Snackbar,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import productService, { Product } from '../../services/productService';
import { useCart } from '../../contexts/CartContext';
import { useNotification } from '../shared/Notification';

interface ProductsListProps {
  onSelectProduct?: (product: Product) => void;
  onBack?: () => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ onSelectProduct, onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { addItem, getItemQuantity, state } = useCart();

  // Carregar produtos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAll({ activeOnly: true });
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filtrar produtos
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

  // Obter categorias únicas
  const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  const handleSelectProduct = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Produtos
      </Typography>

      {/* Busca */}
      <TextField
        fullWidth
        placeholder="Buscar produtos..."
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

      {/* Filtro por categoria */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label="Todas"
          variant={!selectedCategory ? 'filled' : 'outlined'}
          onClick={() => setSelectedCategory('')}
          sx={{ mb: 1 }}
        />
        {categories.map(category => (
          <Chip
            key={category}
            label={category}
            variant={selectedCategory === category ? 'filled' : 'outlined'}
            onClick={() => setSelectedCategory(category)}
            sx={{ mb: 1 }}
          />
        ))}
      </Box>

      {/* Lista de produtos */}
      <Grid container spacing={2}>
        {filteredProducts.map((product) => {
          const quantity = getItemQuantity(product.id);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => handleSelectProduct(product)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {product.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      R$ {product.price.toFixed(2)}
                    </Typography>
                    <Chip 
                      label={product.category} 
                      size="small" 
                      variant="outlined" 
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Estoque: {product.stock}
                    </Typography>
                    
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={quantity > 0 ? <CheckIcon /> : <AddIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={product.stock === 0}
                      sx={{ 
                        bgcolor: quantity > 0 ? 'success.main' : 'primary.main',
                        '&:hover': {
                          bgcolor: quantity > 0 ? 'success.dark' : 'primary.dark',
                        }
                      }}
                    >
                      {quantity > 0 ? `${quantity}` : 'Adicionar'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredProducts.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 4 }}>
          Nenhum produto encontrado com os filtros aplicados.
        </Alert>
      )}

      {/* FAB para ir ao carrinho */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000
        }}
        onClick={() => {/* Navegar para carrinho */}}
      >
        <Badge badgeContent={state.itemCount} color="error">
          <CartIcon />
        </Badge>
      </Fab>
    </Box>
  );
};

export default ProductsList;