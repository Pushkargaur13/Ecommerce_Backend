import express from "express";
import { createReview, getProductReviews, deleteReview } from "../controllers/review.controller";

const router = express.Router();

router.post("/:productId", createReview);
router.get("/:productId", getProductReviews);
router.delete("/:id", deleteReview);

export default router;
