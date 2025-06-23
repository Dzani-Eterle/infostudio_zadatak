export type Order = {
  id: number;
  product_name: string;
  customer: string;
  quantity: number;
  price: number;
  delivery_address: string;
  status: 'CREATED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  created_at: string; 
};
