export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: string;
  stock: number;
  in_stock: boolean;
  sku?: string;
  featured: boolean;
  primary_image: string | null;
  category_name: string;
  category: number;
  images?: ProductImage[];
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  product_count?: number;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  subtotal: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_name: string;
  product_slug: string;
  price: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: string;
  order_number: string;
  email: string;
  status: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_address_line1: string;
  shipping_address_line2: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  payment_method: string;
  payment_status: string;
  subtotal: string;
  tax: string;
  total: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface UserProfile {
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
