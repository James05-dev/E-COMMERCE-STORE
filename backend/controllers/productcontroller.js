/**
 * Get all products
 * @returns {Object} products
 */
import product from "../models/product.model.js";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
export const getAllProducts = async (req, res) => {
  try {
    const Products = await product.find({});
    res.json({ Products });
  } catch (error) {
    console.log("Error in getAllproducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get featured products
 * @returns {Object} featuredProducts
 */
export const getFeaturedProducts = async (req, res) => {
  try {
    // Check if featured products are cached in redis
    let featuredProducts = await redis.get("featuredProducts");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }
    // If not cached, query the database and store in redis
    featuredProducts = await product.find({ isfeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }
    await redis.set("featuredProducts", JSON.stringify(featuredProducts));
    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    console.log("ETERED THE CREATE PRODUCT COTROLLER");
    const { name, description, price, image, category } = req.body;
    console.log("RECEIVED CREATE DATA", req.body);
    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }
    console.log("REACHED LINE 55");
    const Product = await product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse?.secure_url
        : "",
      category,
    });

    res.status(201).json(Product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const Product = await product.findById(req.params.id);
    if (!Product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (Product.image) {
      const publicId = Product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(publicId);
        console.log("deleted image from cloudinary");
      } catch (error) {
        console.log("Error deleting image from cloudinary", error);
      }
    }
    await product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await product.aggregate([
      {
        $sample: {
          size: 4,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          description: 1,
          price: 1,
        },
      },
    ]);
    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await product.find({ category });
    res.json(products);
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await product.findById(req.params.id);
    if (product) {
      product.isfeatured = !product.isfeatured;
      const updatedProduct = await product.save();
      await updatedFeaturedProducts();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
async function updatedFeaturedProductsCache() {
  try {
    const featuredProducts = await product.find({ isfeatured: true }).lean();
    await redis.set("featured_Products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update cache function");
  }
}
