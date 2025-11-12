import z from "zod";

export const createProductBody = z.object({
    body: z.object({
        title: z.string().min(1, "title is required"),
        description: z.string().optional(),
        category: z.string().optional(),
        price: z
            .number()
            .positive("price must be > 0"),
        discountPercentage: z.number().nonnegative().optional(),
        rating: z.number().min(0).max(5).optional(),
        stock: z.number().int().nonnegative().optional(),
        brand: z.string().optional(),
        sku: z.string().max(100).optional(),
        weight: z.number().positive().optional(),
        dimensions: z.string().optional(),
        warrantyInformation: z.string().optional(),
        shippingInformation: z.string().optional(),
        availabilityStatus: z.string().optional(),
        returnPolicy: z.string().optional(),
        minimumOrderQuantity: z.number().int().nonnegative().optional(),
        meta: z.any().optional(),
        thumbnail: z.string().url().optional(),
        // images: z.array(z.string().url()).optional(), // if you add images arr later
    }),
});

export const updateProductBody = z.object({
    body: z.object({
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        price: z
            .number()
            .positive("price must be > 0")
            .optional(),
        discountPercentage: z.number().nonnegative().optional(),
        rating: z.number().min(0).max(5).optional(),
        stock: z.number().int().nonnegative().optional(),
        brand: z.string().optional(),
        sku: z.string().max(100).optional(),
        weight: z.number().positive().optional(),
        dimensions: z.string().optional(),
        warrantyInformation: z.string().optional(),
        shippingInformation: z.string().optional(),
        availabilityStatus: z.string().optional(),
        returnPolicy: z.string().optional(),
        minimumOrderQuantity: z.number().int().nonnegative().optional(),
        meta: z.any().optional(),
        thumbnail: z.string().url().optional(),
    }),
});

export const createProductSchema = createProductBody;
export const updateProductSchema = updateProductBody;

