"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const API_URL = "https://dummyjson.com/products?limit=100";
async function main() {
    console.log("🌱 Starting database seed...");
    const res = await fetch(API_URL);
    const data = await res.json();
    const products = data.products || [];
    console.log(`✅ Fetched ${products.length} products from DummyJSON.`);
    const productData = products.map((p) => ({
        title: p.title,
        description: p.description,
        category: p.category,
        price: p.price,
        discountPercentage: p.discountPercentage,
        rating: p.rating,
        stock: p.stock,
        brand: p.brand,
        sku: p.sku ?? `${p.id}`,
        thumbnail: p.thumbnail,
        // images: p.images,
        warrantyInformation: "1 year warranty",
        shippingInformation: "Ships in 3–5 days",
        availabilityStatus: p.stock > 0 ? "In Stock" : "Out of Stock",
        returnPolicy: "30-day return policy",
        minimumOrderQuantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
    }));
    await prisma.product.createMany({
        data: productData,
        skipDuplicates: true,
    });
    console.log(`🛒 Inserted ${productData.length} products.`);
    const allProducts = await prisma.product.findMany({ select: { id: true, sku: true } });
    const skuToId = new Map(allProducts.map((p) => [p.sku, p.id]));
    const reviewData = products.flatMap((p) => (p.reviews || []).map((r) => ({
        rating: r.rating,
        comment: r.comment,
        date: new Date(r.date || Date.now()),
        reviewerName: r.reviewerName || "Anonymous",
        reviewerEmail: r.reviewerEmail || "unknown@example.com",
        productId: skuToId.get(p.sku ?? `${p.id}`),
    })));
    if (reviewData.length > 0) {
        await prisma.review.createMany({ data: reviewData });
        console.log(`⭐ Inserted ${reviewData.length} reviews.`);
    }
    else {
        console.log("ℹ️ No reviews found in source data.");
    }
    console.log("✅ Seeding complete!");
}
main()
    .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
