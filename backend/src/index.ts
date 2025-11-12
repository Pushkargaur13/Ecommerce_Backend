import express from "express";
import cors from "cors";
import productRoutes from "./routes/product.routes";
import reviewRoutes from "./routes/review.routes";
import authRoutes from "./routes/auth.routes"
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
import { listUsers, assignRole, removeRole } from './controllers/admin.controller';
import { authenticate } from './middleware/auth.middleware';
import { authorize } from './middleware/authorize.middleware';
import { requestId } from "./middleware/requestId";
import { requestLogger } from "./middleware/logger";
import { securityMiddlewares } from "./middleware/security";
import { metricsMiddleware } from "./middleware/metrics";
import { createGlobalRateLimiter } from "./middleware/rateLimiter";

dotenv.config()
const app = express();
const PORT = process.env.PORT ?? 3000

const allowedOrigins = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`CORS: rejecting origin ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
  exposedHeaders: ['X-Cache', 'X-Cache-Timestamp', 'X-Request-Id'], 
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(requestId); 
// app.use(requestLogger); 
securityMiddlewares(app);
metricsMiddleware(app);
app.use(createGlobalRateLimiter());
app.use(express.json());
app.use(cookieParser());

app.use("/api/products", authenticate, productRoutes);
app.use("/api/reviews", authenticate, reviewRoutes);
app.use("/api/auth", authRoutes)

app.get('/users', authenticate, authorize(['ADMIN']), listUsers);
app.post('/users/:userId/roles', authenticate, authorize(['ADMIN']), assignRole);
app.delete('/users/:userId/roles', authenticate, authorize(['ADMIN']), removeRole);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Running on port ${PORT}`))

export default app;
