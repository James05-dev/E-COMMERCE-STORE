import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

/**
 * Generate access and refresh tokens
 * @param {Object} user - User object
 * @param {String} _id - User id
 * @returns {Object} - Tokens object
 */
const generateTokens = (user, _id) => {
  const accessToken = jwt.sign(
    { userId: _id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
  const refreshToken = jwt.sign(
    { userId: _id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
  // console.log('ACCESS TOKEN',accessToken,'REFRESH TOKEN',refreshToken)
  return { accessToken, refreshToken };
};

/**
 * Store refresh token in redis
 * @param {String} userId - User id
 * @param {String} refreshToken - Refresh token
 */
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};

/**
 * Set http only cookies
 * @param {Object} res - Response object
 * @param {String} accessToken - Access token
 * @param {String} refreshToken - Refresh token
 */
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //accessible only by web server
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000, //15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //accessible only by web server
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevents xss attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  });
};

/**
 * Signup user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      console.log("Returned from signup");
      return;
    }
    const user = await User.create({ name, email, password });

    console.log("Attempting to generate a token");
    const { accessToken, refreshToken } = generateTokens(user, user._id);

    console.log(
      "Signup function:",
      "ACCESS TOKEN",
      accessToken,
      "REFRESH TOKEN",
      refreshToken
    );
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.json({
      name: user.name,
      email: user.email,
      _id: user._id,
      role: user.role,
    });
  } catch (error) {
    console.log("An error occured", error.message);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Login user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user, user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);

      res.json({
        name: user.name,
        email: user.email,
        _id: user._id,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Logout user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

/**
 * Refresh token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "no refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invaild refresh token " });
    }
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true, //accessible only by web server
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
