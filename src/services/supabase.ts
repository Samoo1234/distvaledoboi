import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase com variáveis de ambiente
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('🚨 ERRO: As variáveis de ambiente Supabase não estão configuradas!');
  console.error('📁 Crie um arquivo .env na raiz do projeto com:');
  console.error('   REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co');
  console.error('   REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima');
  console.error('📖 Consulte o arquivo ENV-SETUP.md para instruções detalhadas');
  
  // Lança erro para evitar problemas silenciosos
  throw new Error('Configuração do Supabase está faltando. Consulte ENV-SETUP.md');
}

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces para tipagem dos dados
export interface User {
  id: string;
  name: string;
  email: string;
  profile: 'vendedor' | 'separacao' | 'admin';
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
}

export interface Customer {
  id: number;
  name: string;
  address: string;
  phone: string;
  vendedor_id: string;
}

export interface Order {
  id: number;
  customer_id: number;
  vendedor_id: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  created_at: string;
  customer?: Customer;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

// Funções utilitárias para Supabase
export const supabaseUtils = {
  // Funções de produtos
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },
  
  // Funções de clientes
  async getCustomers(vendedor_id?: string) {
    let query = supabase.from('customers').select('*');
    
    if (vendedor_id) {
      query = query.eq('vendedor_id', vendedor_id);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    return data;
  },
  
  // Funções de pedidos
  async getOrders(filters?: { 
    status?: string,
    vendedor_id?: string,
    customer_id?: number
  }) {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customer:customers(name, address, phone)
      `);
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.vendedor_id) {
      query = query.eq('vendedor_id', filters.vendedor_id);
    }
    
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  async getOrderDetails(order_id: number) {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(name, description, price)
      `)
      .eq('order_id', order_id);
    
    if (error) throw error;
    return data;
  },
  
  // Função para criar pedido
  async createOrder(order: Omit<Order, 'id' | 'created_at'>, items: Omit<OrderItem, 'id' | 'order_id'>[]) {
    // Inicia uma transação
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select('id')
      .single();
    
    if (orderError) throw orderError;
    
    // Insere os itens do pedido
    const orderItems = items.map(item => ({
      ...item,
      order_id: orderData.id
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) throw itemsError;
    
    return orderData.id;
  }
};
