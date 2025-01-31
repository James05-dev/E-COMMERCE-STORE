import express from "express";
import {
  login,
  logout,
  signup,
  refreshToken,
  getProfile,
  // getProfile,
} from "../controllers/authcontroller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new user
router.post("/signup", signup);

// Login user and generate access and refresh tokens
router.post("/login", login);

// Logout user and clear cookies
router.post("/logout", logout);

// Generate new access token with refresh token
router.post("/refresh-token", refreshToken);

// Get user profile (protected route)
router.post("/profile", protectRoute, getProfile);

export default router;
