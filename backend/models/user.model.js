/**
 * User model
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User schema definition
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "name is required"] },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [6, "password must be at least 6 characters long"],
    },
    cartItems: [
      {
        quantity: { type: Number, default: 1 },
        product: { type: mongoose.Schema.ObjectId, ref: "Product" },
      },
    ],
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving to database
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare provided password with hashed password in database
 */
userSchema.methods.comparePassword = async function (Password) {
  return bcrypt.compare(Password, this.password);
};

/**
 * Create model from schema
 */
const User = mongoose.model("User", userSchema);

export default User;
