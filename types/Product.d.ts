export interface Product {
  name: string;
  price: number;
  image: string;
  url: string;
  platform: string;
}

export interface ProductResponse {
  jan_code: string;
  amazon_products: Product[];
  yahoo_products: Product[];
  rakuten_products: Product[];
}

export const DEFAULT_PRODUCT_RESPONSE = {
  jan_code: '',
  amazon_products: [],
  yahoo_products: [],
  rakuten_products: []
}