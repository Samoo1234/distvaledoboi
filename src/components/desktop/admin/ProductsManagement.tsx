import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import productService from '../../../services/productService';
import { useNotification } from '../../shared/Notification';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sku: string;
  active: boolean;
  created_at: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  sku: string;
}

const categories = [
  'Carcaças Bovinas',
  'Carcaças Suínas',
  'Cortes Grandes',
  'Miúdos',
  'Embutidos',
  'Outros'
];

/**
 * Componente para gerenciamento completo de produtos
 */
const ProductsManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    sku: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<ProductForm>>({});
  const { showNotification } = useNotification();

  // Carregar produtos
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll({ activeOnly: false });
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      showNotification({ message: 'Erro ao carregar produtos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Validar formulário
  const validateForm = (): boolean => {
    const errors: Partial<ProductForm> = {};

    if (!formData.name.trim()) errors.name = 'Nome é obrigatório';
    if (!formData.price.trim()) errors.price = 'Preço é obrigatório';
    else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      errors.price = 'Preço deve ser um número positivo';
    }
    if (!formData.stock.trim()) errors.stock = 'Estoque é obrigatório';
    else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      errors.stock = 'Estoque deve ser um número não negativo';
    }
    if (!formData.category) errors.category = 'Categoria é obrigatória';
    if (!formData.sku.trim()) errors.sku = 'SKU é obrigatório';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Abrir dialog para novo produto
  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      sku: ''
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  // Abrir dialog para editar produto
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      sku: product.sku
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  // Salvar produto
  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        sku: formData.sku.trim().toUpperCase()
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, productData);
        showNotification({ message: 'Produto atualizado com sucesso!', type: 'success' });
      } else {
        await productService.create(productData);
        showNotification({ message: 'Produto criado com sucesso!', type: 'success' });
      }

      setDialogOpen(false);
      loadProducts();
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      showNotification({ 
        message: error.message || 'Erro ao salvar produto', 
        type: 'error' 
      });
    }
  };

  // Excluir produto (desativar)
  const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(`Tem certeza que deseja desativar o produto "${product.name}"?`)) {
      return;
    }

    try {
      await productService.deactivate(product.id);
      showNotification({ message: 'Produto desativado com sucesso!', type: 'success' });
      loadProducts();
    } catch (error: any) {
      console.error('Erro ao desativar produto:', error);
      showNotification({ 
        message: error.message || 'Erro ao desativar produto', 
        type: 'error' 
      });
    }
  };

  // Estatísticas rápidas
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
          Gerenciamento de Produtos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
          sx={{ 
            bgcolor: '#990000', 
            '&:hover': { bgcolor: '#660000' } 
          }}
        >
          Novo Produto
        </Button>
      </Box>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total de Produtos
              </Typography>
              <Typography variant="h5" component="h2">
                {totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Produtos Ativos
              </Typography>
              <Typography variant="h5" component="h2">
                {activeProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Estoque Baixo
              </Typography>
              <Typography variant="h5" component="h2" color="error">
                {lowStockProducts}
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
              <Typography variant="h5" component="h2">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por nome ou SKU..."
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
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Categoria"
              >
                <MenuItem value="">Todas as categorias</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
            >
              Limpar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela de produtos */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Categoria</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Preço</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estoque</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nenhum produto encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {product.name}
                      </Typography>
                      {product.description && (
                        <Typography variant="body2" color="text.secondary">
                          {product.description.length > 50 
                            ? `${product.description.substring(0, 50)}...` 
                            : product.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {product.stock.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} kg
                      {product.stock < 10 && (
                        <Chip 
                          label="Baixo" 
                          size="small" 
                          color="error" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.active ? 'Ativo' : 'Inativo'} 
                      color={product.active ? 'success' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleEditProduct(product)}
                      sx={{ color: '#990000' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteProduct(product)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para adicionar/editar produto */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Editar Produto' : 'Novo Produto'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Produto *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Preço (R$) *"
                  type="number"
                  inputProps={{ step: "0.01", min: "0" }}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Estoque (kg) *"
                  type="number"
                  inputProps={{ step: "0.1", min: "0" }}
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  error={!!formErrors.stock}
                  helperText={formErrors.stock}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth error={!!formErrors.category}>
                  <InputLabel>Categoria *</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Categoria *"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.category && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formErrors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="SKU *"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  error={!!formErrors.sku}
                  helperText={formErrors.sku}
                  placeholder="Ex: BOV-ALC-001"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveProduct}
            variant="contained"
            sx={{ bgcolor: '#990000', '&:hover': { bgcolor: '#660000' } }}
          >
            {editingProduct ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsManagement; 