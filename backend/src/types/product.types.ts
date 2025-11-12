export interface ReviewInput {
  rating: number;
  comment: string;
  date?: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductInput {
  title: string;
  description?: string | null;
  category?: string | null;
  price: number;
  discountPercentage?: number | null;
  rating?: number | null;
  stock?: number | null;
  brand?: string | null;
  sku?: string | null;
  weight?: number | null;
  dimensions?: string | null;
  warrantyInformation?: string | null;
  shippingInformation?: string | null;
  availabilityStatus?: string | null;
  returnPolicy?: string | null;
  minimumOrderQuantity?: number | null;
  meta?: any;
  thumbnail?: string | null;
  reviews?: ReviewInput[];
  reviewsToAdd?: ReviewInput[];
}

export type GetAllProductsParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  search?: string;
  category?: string;
};