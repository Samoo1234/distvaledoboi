import apiClient from './apiClient';

/**
 * Interface para clientes
 */
export interface Customer {
  id?: number;
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  salesperson_id: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Serviço de clientes que utiliza o ApiClient autenticado
 */
const customerService = {
  /**
   * Busca todos os clientes
   */
  getAll: async (): Promise<Customer[]> => {
    return apiClient.get<Customer[]>('/customers');
  },

  /**
   * Busca cliente por ID
   */
  getById: async (id: number): Promise<Customer> => {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  /**
   * Cria um novo cliente
   */
  create: async (customer: Customer): Promise<Customer> => {
    return apiClient.post<Customer>('/customers', customer);
  },

  /**
   * Atualiza um cliente existente
   */
  update: async (id: number, customer: Partial<Customer>): Promise<Customer> => {
    return apiClient.put<Customer>(`/customers/${id}`, customer);
  },

  /**
   * Exclui um cliente
   */
  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/customers/${id}`);
  },

  /**
   * Busca clientes por vendedor
   */
  getBySalesperson: async (salespersonId: string): Promise<Customer[]> => {
    return apiClient.get<Customer[]>(`/customers/salesperson/${salespersonId}`);
  }
};

export default customerService;
