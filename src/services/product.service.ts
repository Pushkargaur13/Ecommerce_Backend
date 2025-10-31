import prisma from "../prisma/client";
import { ProductInput } from "../types/product.types";

export const getAllProducts = async () => {
  return prisma.product.findMany({ include: { reviews: true } });
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
