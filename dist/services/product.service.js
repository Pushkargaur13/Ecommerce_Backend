"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getAllProducts = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const getAllProducts = async () => {
    return client_1.default.product.findMany({ include: { reviews: true } });
};
exports.getAllProducts = getAllProducts;
const getProductById = async (id) => {
    return client_1.default.product.findUnique({ where: { id }, include: { reviews: true } });
};
exports.getProductById = getProductById;
const createProduct = async (data) => {
    const sanitized = {
        ...data,
        weight: data.weight ? Number(data.weight) : null,
        price: Number(data.price),
        stock: data.stock ? Number(data.stock) : null,
        discountPercentage: data.discountPercentage ? Number(data.discountPercentage) : null,
        rating: data.rating ? Number(data.rating) : null,
    };
    return client_1.default.product.create({
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
exports.createProduct = createProduct;
const updateProduct = async (id, data) => {
    const existing = await client_1.default.product.findUnique({ where: { id } });
    if (!existing)
        throw new Error("Product not found");
    const updated = await client_1.default.product.update({
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
        await client_1.default.review.createMany({
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
    return client_1.default.product.findUnique({ where: { id }, include: { reviews: true } });
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    const existing = await client_1.default.product.findUnique({ where: { id } });
    if (!existing)
        throw new Error("Product not found");
    await client_1.default.product.delete({ where: { id } });
    return { success: true, id };
};
exports.deleteProduct = deleteProduct;
