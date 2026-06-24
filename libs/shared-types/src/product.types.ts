export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  salePrice: number | null;
  saleStartsAt: string | null;
  saleEndsAt: string | null;
  effectivePrice: number; // computed: salePrice if active sale, else price
  stock: number;
  imageUrl: string | null;
  purchaseCount: number;
  categoryId: string;
  category?: Category;
  isDeleted: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type SortType =
  | 'price_asc'
  | 'price_desc'
  | 'newest'
  | 'oldest'
  | 'popular';

export interface ProductsQuery {
  categoryId?: string;
  sort?: SortType;
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: string;
  salePrice?: number;
  saleStartsAt?: string;
  saleEndsAt?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  categoryId?: string;
  salePrice?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
}
