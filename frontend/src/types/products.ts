interface Review {
  id: number;
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
  productId: number;
}

interface Product {
  id: number;
  title: string;
  description?: string;
  category?: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock?: number;
  brand?: string;
  sku?: string;
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
  reviews?: Review[];
}

type ProductsResponse = {
  data: Product[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type TopRatedListProps = {
  items: Product[];
  onView?: (p: Product) => void;
};

export type { Review, Product, ProductsResponse, TopRatedListProps }