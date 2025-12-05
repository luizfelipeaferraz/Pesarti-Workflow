import { createClient } from '@supabase/supabase-js';
import { Order } from '../types';

// Função segura para ler variáveis de ambiente em diferentes contextos
const getEnvVar = (key: string) => {
  try {
    // Tenta ler do Vite (import.meta.env)
    if (import.meta && (import.meta as any).env) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    // Silencia erros de acesso
  }
  
  try {
    // Fallback para process.env (caso esteja usando outro bundler)
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Silencia erros
  }

  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Funções Auxiliares para o Banco de Dados

export const fetchOrders = async (): Promise<Order[]> => {
  if (!supabase) return [];
  
  // Ordena por 'createdAt' (nome exato da coluna no SQL)
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('createdAt', { ascending: true });

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
  
  return data as Order[];
};

export const createOrder = async (order: Order) => {
  if (!supabase) return;

  const { error } = await supabase
    .from('orders')
    .insert([order]);

  if (error) {
    console.error('Erro ao criar pedido:', error);
    throw error;
  }
};

export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
  if (!supabase) return;

  // Supabase precisa que os campos jsonb sejam passados corretamente
  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (error) {
    console.error('Erro ao atualizar pedido:', error);
    throw error;
  }
};