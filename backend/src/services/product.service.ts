import prisma from "../prisma/client";
import { GetAllProductsParams, ProductInput } from "../types/product.types";

export const getAllProducts = async (params: GetAllProductsParams = {}) => {
  const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", search, category,} = params;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { reviews: true },
      orderBy: { [sortBy]: order } as any,
      skip,
      take: limit,
    }),
  ]);

  return { data: products, total };
};

export const getDashboardData = async () => {
  const [totalProducts, totalStockAgg, priceAgg, ratingAgg] = await prisma.$transaction([
    prisma.product.count(),
    prisma.product.aggregate({ _sum: { stock: true } }),
    prisma.product.aggregate({ _avg: { price: true } }),
    prisma.product.aggregate({ _avg: { rating: true } }),
  ]);

  const topRated = await prisma.product.findMany({
    where: {}, 
    orderBy: { rating: "desc" },
    include: { reviews: true },
    take: 3,
  });

  const recentReviews = await prisma.review.findMany({
    orderBy: { date: "desc" },
    take: 6,
    include: { product: { select: { id: true, title: true, thumbnail: true } } },
  });

  return {
    stats: {
      totalProducts,
      totalStock: totalStockAgg._sum.stock ?? 0,
      avgPrice: Number(priceAgg._avg.price ?? 0),
      avgRating: Number(ratingAgg._avg.rating ?? 0),
    },
    topRated,
    recentReviews,
  };
};

export const getProductById = async (id: number) => {
  return prisma.product.findUnique({ where: { id }, include: { reviews: true } });
};

export const createProduct = async (data: ProductInput) => {
  const sanitized = {
    ...data,
    weight: data.weight ? Number(data.weight) : null,
    price: Number(data.price),
    stock: data.stock ? Number(data.stock) : null,
    discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : null,
    rating: data.rating ? Number(data.rating) : null,
  };

  return prisma.product.create({
    data: {
      ...sanitized,
      reviews: data.reviews
        ? {
            create: data.reviews.map((r) => ({
              rating: r.rating,
              comment: r.comment,
              date: r.date ? new Date(r.date) : undefined,
              reviewerName: r.reviewerName,
              reviewerEmail: r.reviewerEmail,
            })),
          }
        : undefined,
    },
  });
};

export const updateProduct = async (id: number, data: ProductInput) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  const updated = await prisma.product.update({
    where: { id },
    data: {
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      category: data.category ?? existing.category,
      price: data.price ?? existing.price,
      discountPercentage: data.discountPercentage ?? existing.discountPercentage,
      rating: data.rating ?? existing.rating,
      stock: data.stock ?? existing.stock,
      brand: data.brand ?? existing.brand,
      sku: data.sku ?? existing.sku,
      weight: data.weight ?? existing.weight,
      dimensions: data.dimensions ?? existing.dimensions,
      warrantyInformation: data.warrantyInformation ?? existing.warrantyInformation,
      shippingInformation: data.shippingInformation ?? existing.shippingInformation,
      availabilityStatus: data.availabilityStatus ?? existing.availabilityStatus,
      returnPolicy: data.returnPolicy ?? existing.returnPolicy,
      minimumOrderQuantity: data.minimumOrderQuantity ?? existing.minimumOrderQuantity,
      meta: data.meta ?? existing.meta,
      thumbnail: data.thumbnail ?? existing.thumbnail,
      updatedAt: new Date(), 
    },
    include: { reviews: true },
  });

  if (data.reviewsToAdd?.length) {
    await prisma.review.createMany({
      data: data.reviewsToAdd.map((r) => ({
        rating: r.rating,
        comment: r.comment,
        date: r.date ? new Date(r.date) : new Date(),
        reviewerName: r.reviewerName,
        reviewerEmail: r.reviewerEmail,
        productId: id,
      })),
    });
  }

  return prisma.product.findUnique({ where: { id }, include: { reviews: true } });
};


export const deleteProduct = async (id: number) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  await prisma.product.delete({ where: { id } });
  return { success: true, id };
};
