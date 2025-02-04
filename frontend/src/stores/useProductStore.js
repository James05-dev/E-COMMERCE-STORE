import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  createProduct: async (productdata) => {
    console.log('Product data',productdata)
    set({ loading: true });
    try {
      const res = await axios.post("/products", productdata);
      set((prevstate) => {
        if (!(prevstate.products)) {
          prevstate.products = []
        }
        return {
        products: [...prevstate.products, res.data],
        loading: false,
      }});
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data.error || "An error occurred");
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/products");
      set({ products: res.data.products, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch products", loading: false });
      toast.error(error.response.data.error || "Failed to fetch products");
    }
  },
  deleteProduct: async (id) => {
    set({ loading: true });
    const res = await axios.delete(`/products/${id}`)
    const res2 = await axios.get("/products");
    set({ products: res2.data.products, loading: false });
  },
  toggleFeaturedProduct: async (id) => {

  },
}));
