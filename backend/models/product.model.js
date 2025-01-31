import mongoose from "mongoose";

/**
 * Product model
 */
const productSchema = new mongoose.Schema(
  {
    /**
     * Product name
     */
    name: {
      type: String,
      required: true,
    },
    /**
     * Product description
     */
    description: {
      type: String,
      required: true,
    },
    /**
     * Product price
     */
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    /**
     * Product image
     */
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    /**
     * Is product featured?
     */
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

/**
 * Product model
 */
const product = mongoose.model("product", productSchema);

export default product;
