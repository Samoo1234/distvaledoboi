import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product } from '../services/productService';
import { Customer } from '../services/customerService';

export interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}

export interface CartState {
  items: CartItem[];
  selectedCustomer: Customer | null;
  total: number;
  itemCount: number;
  notes: string;
}

export interface CartContextType {
  state: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
  hasItem: (productId: number) => boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
  | { type: 'SET_CUSTOMER'; payload: { customer: Customer | null } }
  | { type: 'SET_NOTES'; payload: { notes: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: { state: CartState } };

// Estado inicial
const initialState: CartState = {
  items: [],
  selectedCustomer: null,
  total: 0,
  itemCount: 0,
  notes: ''
};

// Chave para localStorage
const CART_STORAGE_KEY = 'valedoboi_cart';

// Reducer para gerenciar estado do carrinho
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product.id === product.id);
      
      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Item já existe, atualiza quantidade
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * item.product.price
              }
            : item
        );
      } else {
        // Novo item
        newItems = [
          ...state.items,
          {
            product,
            quantity,
            total: quantity * product.price
          }
        ];
      }
      
      const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }
    
    case 'REMOVE_ITEM': {
      const { productId } = action.payload;
      const newItems = state.items.filter(item => item.product.id !== productId);
      const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item se quantidade for 0 ou menor
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { productId } });
      }
      
      const newItems = state.items.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              total: quantity * item.product.price
            }
          : item
      );
      
      const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: newItems,
        total: newTotal,
        itemCount: newItemCount
      };
    }
    
    case 'SET_CUSTOMER':
      return {
        ...state,
        selectedCustomer: action.payload.customer
      };
    
    case 'SET_NOTES':
      return {
        ...state,
        notes: action.payload.notes
      };
    
    case 'CLEAR_CART':
      return {
        ...initialState
      };
    
    case 'LOAD_CART':
      return action.payload.state;
    
    default:
      return state;
  }
};

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook para usar o carrinho
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};

// Provider
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: { state: parsedCart } });
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }, [state]);

  // Funções do contexto
  const addItem = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };

  const removeItem = (productId: number) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const setCustomer = (customer: Customer | null) => {
    dispatch({ type: 'SET_CUSTOMER', payload: { customer } });
  };

  const setNotes = (notes: string) => {
    dispatch({ type: 'SET_NOTES', payload: { notes } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (productId: number): number => {
    const item = state.items.find(item => item.product.id === productId);
    return item?.quantity || 0;
  };

  const hasItem = (productId: number): boolean => {
    return state.items.some(item => item.product.id === productId);
  };

  const contextValue: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    setCustomer,
    setNotes,
    clearCart,
    getItemQuantity,
    hasItem
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}; 