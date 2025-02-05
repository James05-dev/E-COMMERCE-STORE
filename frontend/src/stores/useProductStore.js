import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set, get) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  createProduct: async (productdata) => {
    console.log("CALLED THE CREATE PRODUCT FUNC");
    console.log("Product data", productdata);
    set({ loading: true });
    try {
      const res = await axios.post("/products", productdata);
      set((prevstate) => {
        if (!prevstate.products) {
          prevstate.products = [];
        }
        return {
          products: [...prevstate.products, res.data],
          loading: false,
        };
      });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data.error || "An error occurred");
    }
  },

  fetchAllProducts: async () => {
    console.log("CALLED FETCH ALL PROD");
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      console.log("PRODUCT DATA", res.data.Products);
      set({ products: res.data.Products, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.response.data.error || "Failed to fetch products");
    }
  },

  fetchProductsByCategory: async (category) => {
    console.log("CALLED FETCH BY CAT");
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      console.log("test", response.data);
      set({ products: response.data, loading: false });
    } catch (error) {
      set({ error: "failed to fetch products", loading: false });
      toast.error(error.reponse.data.error || "failed to fetch products");
    }
  },
  deleteProduct: async (productId) => {
    console.log("CALLED DELETE PRODUCT");
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((prevProducts) => ({
        products: prevProducts.products.filter(
          (product) => product._id !== productId
        ),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.error || "failed to delete product");
    }
  },
  toggleFeaturedProduct: async (productId) => {
    console.log("CALLED TOGGLED FEATURED PROD");
    set({ loading: true });
    try {
      const response = await axios.patch(`/products/${productId}`);
      set((prevProducts) => ({
        products: prevProducts.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: response.data.isFeatured }
            : product
        ),
        loading: false,
      }));
      console.log("Product data after fetching", get());
    } catch (error) {
      set({ loading: false });
      toast.error(error.response.data.error || "failed to update product");
    }
  },
}));
