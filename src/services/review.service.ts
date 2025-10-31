import { PrismaClient } from "@prisma/client";
import { ReviewInput } from "../types/product.types";

const prisma = new PrismaClient();

export const reviewService = {
  async createReview(productId: number, data: ReviewInput) {
    return await prisma.review.create({
      data: {
        ...data,
        product: { connect: { id: productId } },
      },
    });
  },

  async getReviewsByProduct(productId: number) {
    return await prisma.review.findMany({
      where: { productId },
      orderBy: { date: "desc" },
    });
  },

  async deleteReview(id: number) {
    return await prisma.review.delete({ where: { id } });
  },
};
