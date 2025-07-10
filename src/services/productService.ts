import { supabase } from './supabase';

/**
 * Interface para produtos da distribuidora
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  active: boolean;
  sku: string;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para filtros de produtos
 */
export interface ProductFilters {
  category?: string;
  search?: string;
  activeOnly?: boolean;
}

/**
 * Interface para criação/edição de produtos
 */
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  active?: boolean;
  sku: string;
}

/**
 * Serviço de produtos usando Supabase diretamente
 */
const productService = {
  /**
   * Busca todos os produtos ativos
   */
  getAll: async (filters?: ProductFilters): Promise<Product[]> => {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('name');

      // Aplicar filtros
      if (filters?.activeOnly !== false) {
        query = query.eq('active', true);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Erro no productService.getAll:', error);
      throw error;
    }
  },

  /**
   * Busca produto por ID
   */
  getById: async (id: number): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar produto:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no productService.getById:', error);
      throw error;
    }
  },

  /**
   * Busca produtos por categoria
   */
  getByCategory: async (category: string): Promise<Product[]> => {
    return productService.getAll({ category, activeOnly: true });
  },

  /**
   * Busca produtos por termo de pesquisa
   */
  search: async (query: string): Promise<Product[]> => {
    return productService.getAll({ search: query, activeOnly: true });
  },

  /**
   * Busca todas as categorias disponíveis
   */
  getCategories: async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('active', true);

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }

      // Extrair categorias únicas
      const categories = Array.from(new Set(data?.map(item => item.category) || []));
      return categories.sort();
    } catch (error) {
      console.error('Erro no productService.getCategories:', error);
      throw error;
    }
  },

  /**
   * Cria um novo produto
   * Requer permissão de administrador
   */
  create: async (product: ProductInput): Promise<Product> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...product,
          active: product.active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar produto:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no productService.create:', error);
      throw error;
    }
  },

  /**
   * Atualiza um produto existente
   * Requer permissão de administrador
   */
  update: async (id: number, product: Partial<ProductInput>): Promise<Product> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...product,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro no productService.update:', error);
      throw error;
    }
  },

  /**
   * Atualiza estoque de um produto
   */
  updateStock: async (id: number, newStock: number): Promise<Product> => {
    return productService.update(id, { stock: newStock });
  },

  /**
   * Desativa um produto (soft delete)
   */
  deactivate: async (id: number): Promise<Product> => {
    return productService.update(id, { active: false });
  },

  /**
   * Ativa um produto
   */
  activate: async (id: number): Promise<Product> => {
    return productService.update(id, { active: true });
  }
};

export default productService;
