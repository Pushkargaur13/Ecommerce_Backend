import { Request, Response, NextFunction } from "express";
import * as productService from "../services/product.service";
import { ProductInput } from "../types/product.types";

export const getProducts = async (_: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
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
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request<{ id: string }, {}, ProductInput>, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const updated = await productService.updateProduct(id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await productService.deleteProduct(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
