import { supabase, supabaseUtils } from './supabase';

/**
 * Serviço de API para o Sistema Vale do Boi
 * Centraliza todas as chamadas de API para manipulação de dados
 */
export const api = {
  // Autenticação - funções delegadas para useAuth
  auth: {
    getCurrentUser: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
  },
  
  // Produtos
  products: {
    getAll: async () => {
      return await supabaseUtils.getProducts();
    },
    
    getById: async (id: number) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    getByCategory: async (category: string) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category);
      
      if (error) throw error;
      return data;
    },
    
    search: async (query: string) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query}%`);
      
      if (error) throw error;
      return data;
    }
  },
  
  // Clientes
  customers: {
    getAll: async (vendedor_id?: string) => {
      return await supabaseUtils.getCustomers(vendedor_id);
    },
    
    getById: async (id: number) => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    create: async (customer: any) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    
    update: async (id: number, customer: any) => {
      const { data, error } = await supabase
        .from('customers')
        .update(customer)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    }
  },
  
  // Pedidos
  orders: {
    getAll: async (filters?: any) => {
      return await supabaseUtils.getOrders(filters);
    },
    
    getById: async (id: number) => {
      const [order, items] = await Promise.all([
        supabaseUtils.getOrders({ customer_id: id }).then(data => data[0]),
        supabaseUtils.getOrderDetails(id)
      ]);
      
      return {
        ...order,
        items
      };
    },
    
    create: async (order: any, items: any[]) => {
      return await supabaseUtils.createOrder(order, items);
    },
    
    updateStatus: async (id: number, status: string) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    }
  },
  
  // Usuários
  users: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      return data;
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    update: async (id: string, userData: any) => {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    }
  }
};

export default api;
