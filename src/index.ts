import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes";
import reviewRoutes from "./routes/review.routes";
import { errorHandler } from "./middleware/errorHandler";
import dotenv from "dotenv"

dotenv.config()
const app = express();
const PORT = process.env.PORT ?? 3000

app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use(errorHandler);

app.listen(PORT, ()=> console.log(`Running on port ${PORT}`))

export default app;
