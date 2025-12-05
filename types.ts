export type OrderStatus = 'DESIGN_PENDING' | 'APPROVAL_PENDING' | 'PRODUCTION_PENDING' | 'COMPLETED';

export type OrderCategory = 
  | 'Pet Ilustração' 
  | 'Elementos' 
  | 'Fotografia' 
  | 'Iniciais, Datas e Frases' 
  | 'Eternize' 
  | 'Outros';

export interface ExtractedOrderData {
  orderId: string;
  customerName: string;
  imageLink: string;
  embroideryPosition: string;
  petCount: string;
  category: OrderCategory; // Nova categorização
  optionalText: string;
  sku: string;
  shippingAddress: string;
  productSize: string;
  rawColor: string;
}

export interface OrderHistoryEntry {
  timestamp: string;
  action: string;
  details?: string;
}

export interface Order {
  id: string; // Internal UUID
  data: ExtractedOrderData;
  status: OrderStatus;
  createdAt: string; // ISO String for sorting
  designFileUrl?: string;
  history: OrderHistoryEntry[]; // Log de auditoria
}
