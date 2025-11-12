import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service";
import { ProductInput } from "../types/product.types";
import dashboardService from "../services/dashboard.service";

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100); // max 100
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const order = (req.query.order as string) === "asc" ? "asc" : "desc";
    const search = (req.query.search as string) || undefined;
    const category = (req.query.category as string) || undefined;

    const { data, total } = await productService.getAllProducts({ page, limit, sortBy, order, search, category });
    const totalPages = Math.ceil(total / limit);
    res.json({
      data,
      meta: { page, limit, total, totalPages },
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = await productService.getDashboardData();
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const product = await productService.getProductById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request<{}, {}, ProductInput>, res: Response, next: NextFunction) => {
  try {
    const product = await productService.createProduct(req.body);
    await dashboardService.invalidateDashboardCache();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request<{ id: string }, {}, ProductInput>, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await productService.updateProduct(id, req.body);
    await dashboardService.invalidateDashboardCache();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await productService.deleteProduct(id);
    await dashboardService.invalidateDashboardCache();
    res.json(result);
  } catch (err) {
    next(err);
  }
};
