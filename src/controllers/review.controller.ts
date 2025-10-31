import { Request, Response } from "express";
import { reviewService } from "../services/review.service";

export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const review = await reviewService.createReview(Number(productId), req.body);
    res.status(201).json(review);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductReviews = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = await reviewService.getReviewsByProduct(Number(productId));
    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await reviewService.deleteReview(Number(id));
    res.status(204).end();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
