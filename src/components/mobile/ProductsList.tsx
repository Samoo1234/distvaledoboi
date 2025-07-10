import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Chip,
  Button,
  Grid,
  InputAdornment,
  Alert,
  CircularProgress,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import productService, { Product } from '../../services/productService';

interface ProductsListProps {
  onAddToCart?: (product: Product, quantity: number) => void;
}

/**
 * Lista de produtos para interface mobile (vendedores)
 */
const ProductsList: React.FC<ProductsListProps> = ({ onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cartCount, setCartCount] = useState(0);

  // Carregar produtos e categorias
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Filtrar produtos quando busca ou categoria mudar
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

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

  const filterProducts = () => {
    let filtered = products;

    // Filtro por categoria
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product, 1); // Quantidade padrão: 1kg
      setCartCount(prev => prev + 1);
    }
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

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Cabeçalho */}
      <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', mb: 3, color: '#333' }}>
        🥩 Produtos Disponíveis
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

      {/* Filtros por categoria */}
      <Box sx={{ mb: 3, overflowX: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 1, pb: 1 }}>
          <Chip
            label="Todas"
            onClick={() => setSelectedCategory('')}
            color={selectedCategory === '' ? 'primary' : 'default'}
            sx={{ minWidth: 'auto' }}
          />
          {categories.map(category => (
            <Chip
              key={category}
              label={category}
              onClick={() => setSelectedCategory(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              sx={{ 
                minWidth: 'auto',
                bgcolor: selectedCategory === category ? getCategoryColor(category) : undefined,
                color: selectedCategory === category ? 'white' : undefined
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Lista de produtos */}
      <Grid container spacing={2}>
        {filteredProducts.map(product => (
          <Grid item xs={12} key={product.id}>
            <Card sx={{ 
              borderRadius: 2,
              border: `1px solid ${getCategoryColor(product.category)}20`,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-1px)',
                transition: 'all 0.2s'
              }
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {product.description}
                    </Typography>
                    <Chip
                      label={product.category}
                      size="small"
                      sx={{
                        bgcolor: getCategoryColor(product.category),
                        color: 'white',
                        fontSize: '0.7rem'
                      }}
                    />
                  </Box>
                  <Box sx={{ textAlign: 'right', ml: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#990000' }}>
                      {formatPrice(product.price)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      por kg
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      SKU: {product.sku} • Estoque: {product.stock}kg
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    sx={{
                      bgcolor: '#990000',
                      '&:hover': { bgcolor: '#7d0000' },
                      borderRadius: 2
                    }}
                  >
                    Adicionar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
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
      {cartCount > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            bgcolor: '#990000',
            '&:hover': { bgcolor: '#7d0000' }
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <CartIcon />
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                bgcolor: 'white',
                color: '#990000',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {cartCount}
            </Box>
          </Box>
        </Fab>
      )}
    </Box>
  );
};

export default ProductsList; 