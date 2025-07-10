import apiClient from './apiClient';

/**
 * Interface para produtos
 */
export interface Product {
  id?: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  unit: string;
  stock_quantity: number;
  image_url?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Serviço de produtos que utiliza o ApiClient autenticado
 */
const productService = {
  /**
   * Busca todos os produtos
   */
  getAll: async (): Promise<Product[]> => {
    return apiClient.get<Product[]>('/products');
  },

  /**
   * Busca produto por ID
   */
  getById: async (id: number): Promise<Product> => {
    return apiClient.get<Product>(`/products/${id}`);
  },

  /**
   * Cria um novo produto
   * Requer permissão de administrador
   */
  create: async (product: Product): Promise<Product> => {
    return apiClient.post<Product>('/products', product);
  },

  /**
   * Atualiza um produto existente
   * Requer permissão de administrador
   */
  update: async (id: number, product: Partial<Product>): Promise<Product> => {
    return apiClient.put<Product>(`/products/${id}`, product);
  },

  /**
   * Exclui um produto
   * Requer permissão de administrador
   */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/products/${id}`);
  },

  /**
   * Busca produtos por categoria
   */
  getByCategory: async (category: string): Promise<Product[]> => {
    return apiClient.get<Product[]>(`/products/category/${category}`);
  },

  /**
   * Busca produtos por termo de pesquisa
   */
  search: async (query: string): Promise<Product[]> => {
    return apiClient.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
  }
};

export default productService;
