import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import router from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";

import { connectDB } from "./lib/db.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
const allowedOrigins = [
  "http://localhost:5173",
  // "https://e-commerce-store-kdiw.onrender.com",
  "https://e-commerce-store-lake-gamma.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      } 
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.get("/", (req, res) => {
  res.send("tested");
});

app.listen(PORT, () => {
  console.log("server is running on http://localhost:" + PORT);

  connectDB();
});
