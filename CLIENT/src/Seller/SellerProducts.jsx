import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Package,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_BACKEND_API;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function SellerProducts() {
  const { seller, sellerToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const [activeProduct, setActiveProduct] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    brand: "",
    rating: "",
    stock: "",
    images: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStock, setUpdatingStock] = useState(false);
  const [newStock, setNewStock] = useState("");

  // ---------------- Fetch Products ----------------
  useEffect(() => {
    if (!seller?.seller_id || !sellerToken) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${api}/api/seller/${seller.seller_id}/products`,
          {
            headers: { Authorization: `Bearer ${sellerToken}` },
          }
        );
        setProducts(res.data?.data || []);
      } catch (err) {
        console.error("Error loading seller products:", err);
        toast.error("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [seller?.seller_id, sellerToken]);

  // ---------------- Helpers ----------------
  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      description: "",
      price: "",
      brand: "",
      rating: "",
      stock: "",
      images: [],
    });
    setImageFiles([]);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setActiveProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setActiveProduct(product);
    setForm({
      name: product.name || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price || "",
      brand: product.brand || "",
      rating: product.rating || "",
      stock: product.stock ?? product.quantity ?? "",
      images: product.images || [],
    });
    setImageFiles([]);
    setIsEditModalOpen(true);
  };

  const handleOpenStockModal = (product) => {
    setActiveProduct(product);
    setNewStock(product.stock ?? product.quantity ?? 0);
    setIsStockModalOpen(true);
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };

  // ---------------- Cloudinary Upload ----------------
const uploadImagesToCloudinary = async (files) => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.log("Cloudinary env", { CLOUD_NAME, UPLOAD_PRESET });
    toast.error("Cloudinary config missing in .env");
    return [];
  }

  if (!files.length) return [];

  try {
    setUploadingImages(true);
    const uploadPromises = files.map((file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      return axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );
    });

    const responses = await Promise.all(uploadPromises);
    const urls = responses.map((res) => res.data.secure_url);
    return urls;
  } catch (err) {
    console.error("Error uploading images:", err);
    console.error("Cloudinary response:", err.response?.data);
    toast.error(
      err.response?.data?.error?.message || "Image upload failed. Please try again."
    );
    return [];
  } finally {
    setUploadingImages(false);
  }
};

  // ---------------- Create Product ----------------
  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!seller?.seller_id) {
      toast.error("Seller info missing.");
      return;
    }

    if (!form.name || !form.category || !form.price || !form.brand) {
      toast.error("Please fill all required fields.");
      return;
    }

    let images = [...form.images];

    if (imageFiles.length > 0) {
      if (imageFiles.length < 3) {
        toast.error("Please upload at least 3 images.");
        return;
      }

      const uploadedUrls = await uploadImagesToCloudinary(imageFiles);
      if (!uploadedUrls.length) {
        return;
      }
      images = uploadedUrls;
    } else {
      toast.error("Please upload at least 3 product images.");
      return;
    }

    const payload = {
      seller_id: seller.seller_id,
      name: form.name,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      brand: form.brand,
      rating: form.rating ? Number(form.rating) : undefined,
      stock: form.stock ? Number(form.stock) : 0,
      images,
    };

console.log(payload);

    try {
      setSaving(true);

      const res = await axios.post(`${api}/api/products`, payload, {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });

      const newProduct = res.data?.data;
      if (newProduct) {
        setProducts((prev) => [newProduct, ...prev]);
      }

      toast.success("Product created successfully.");
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error creating product:", err);
      toast.error("Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Update Product ----------------
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!activeProduct) return;

    let images = [...form.images];

    if (imageFiles.length > 0) {
      if (imageFiles.length < 3) {
        toast.error("Please upload at least 3 images.");
        return;
      }

      const uploadedUrls = await uploadImagesToCloudinary(imageFiles);
      if (!uploadedUrls.length) return;
      images = uploadedUrls;
    }

    const payload = {
      name: form.name,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      brand: form.brand,
      rating: form.rating ? Number(form.rating) : undefined,
      stock: form.stock ? Number(form.stock) : 0,
      images,
    };

    try {
      setSaving(true);

      const productId = activeProduct.product_id;
      const res = await axios.put(
        `${api}/api/products/${productId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
        }
      );

      const updated = res.data?.data;
      if (updated) {
        setProducts((prev) =>
          prev.map((p) =>
            p.product_id === updated.product_id ? updated : p
          )
        );
      }

      toast.success("Product updated successfully.");
      setIsEditModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Update Stock Only ----------------
  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!activeProduct) return;

    const value = Number(newStock);
    if (Number.isNaN(value) || value < 0) {
      toast.error("Invalid stock value.");
      return;
    }

    try {
      setUpdatingStock(true);
      const productId = activeProduct.product_id;

      const res = await axios.put(
        `${api}/api/products/${productId}`,
        { stock: value },
        {
          headers: { Authorization: `Bearer ${sellerToken}` },
        }
      );

      const updated = res.data?.data;
      if (updated) {
        setProducts((prev) =>
          prev.map((p) =>
            p.product_id === updated.product_id ? updated : p
          )
        );
      }

      toast.success("Stock updated successfully.");
      setIsStockModalOpen(false);
    } catch (err) {
      console.error("Error updating stock:", err);
      toast.error("Failed to update stock.");
    } finally {
      setUpdatingStock(false);
    }
  };

  // ---------------- Delete Product ----------------
  const handleDeleteProduct = async (product) => {
    const confirmDelete = window.confirm(
      `Delete product "${product.name}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      const productId = product.product_id;
      await axios.delete(`${api}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${sellerToken}` },
      });

      setProducts((prev) =>
        prev.filter((p) => p.product_id !== productId)
      );
      toast.success("Product deleted.");
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Failed to delete product.");
    }
  };

  // ---------------- Filtering & Search ----------------
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || p.category === categoryFilter;

      const stockVal = p.stock ?? p.quantity ?? 0;

      let matchesStock = true;
      if (stockFilter === "low") {
        matchesStock = stockVal > 0 && stockVal <= 10;
      } else if (stockFilter === "out") {
        matchesStock = stockVal === 0;
      } else if (stockFilter === "in") {
        matchesStock = stockVal > 10;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const getStockBadge = (p) => {
    const stockVal = p.stock ?? p.quantity ?? 0;
    if (stockVal === 0)
      return (
        <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 border border-rose-100">
          Out of stock
        </span>
      );
    if (stockVal <= 10)
      return (
        <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-100">
          Low ({stockVal})
        </span>
      );
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-100">
        In stock ({stockVal})
      </span>
    );
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Product Catalog
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Your Products</span>
              <Package size={20} className="text-indigo-600" />
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              Manage all the products you are selling on SwiftCart. Add new
              products, edit details, control stock and clean up inactive items.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-black active:scale-[0.98] transition"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 md:mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2 md:gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter size={14} />
              <span>Filters</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-w-[120px]"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-w-[120px]"
            >
              <option value="all">All stock</option>
              <option value="in">In stock (&gt;10)</option>
              <option value="low">Low stock (1–10)</option>
              <option value="out">Out of stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading products...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-xs text-slate-500">
              No products match your filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs md:text-[13px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 pr-4 font-medium">Product</th>
                    <th className="py-2.5 pr-4 font-medium">Category</th>
                    <th className="py-2.5 pr-4 font-medium">Price</th>
                    <th className="py-2.5 pr-4 font-medium">Stock</th>
                    <th className="py-2.5 pr-4 font-medium">Rating</th>
                    <th className="py-2.5 pr-4 font-medium">Created</th>
                    <th className="py-2.5 pr-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p._id || p.product_id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                            {p.images && p.images.length > 0 ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-slate-900">
                              {p.name}
                            </p>
                            {p.brand && (
                              <p className="text-[10px] text-slate-500">
                                {p.brand}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 pr-4 text-[11px] text-slate-600">
                        {p.category || "-"}
                      </td>

                      <td className="py-2.5 pr-4 text-[11px] text-slate-800">
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-2.5 pr-4 text-[11px]">
                        {getStockBadge(p)}
                      </td>

                      <td className="py-2.5 pr-4 text-[11px] text-slate-700">
                        {p.rating ? `${p.rating}★` : "-"}
                      </td>

                      <td className="py-2.5 pr-4 text-[11px] text-slate-500">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "-"}
                      </td>

                      <td className="py-2.5 pr-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenStockModal(p)}
                            className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] text-slate-700 hover:bg-slate-50"
                          >
                            Edit stock
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="inline-flex items-center justify-center rounded-full border border-slate-200 p-1.5 hover:bg-slate-50"
                          >
                            <Edit className="h-3.5 w-3.5 text-slate-700" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="inline-flex items-center justify-center rounded-full border border-rose-200 p-1.5 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* -------------- ADD PRODUCT MODAL -------------- */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                Add New Product
              </h2>
              <p className="text-[11px] text-slate-500 mb-4">
                Fill in the details and upload at least 3 images.
              </p>

              <form className="space-y-3 max-h-[70vh] overflow-y-auto pr-1" onSubmit={handleCreateProduct}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Product name"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Brand *
                    </label>
                    <input
                      name="brand"
                      value={form.brand}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Brand"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Category *
                    </label>
                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Eg: Electronics"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      max="5"
                      min="0"
                      name="rating"
                      value={form.rating}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="4.5"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChangeForm}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                    placeholder="Describe the product..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Images (min 3) *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full text-[11px] file:mr-2 file:rounded-full file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-black"
                  />
                  <p className="text-[10px] text-slate-500">
                    You selected {imageFiles.length} file(s). Minimum 3 required.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!saving && !uploadingImages) {
                        setIsAddModalOpen(false);
                        resetForm();
                      }
                    }}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingImages}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-black disabled:opacity-70"
                  >
                    {saving || uploadingImages ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Create Product"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* -------------- EDIT PRODUCT MODAL -------------- */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                Edit Product
              </h2>
              <p className="text-[11px] text-slate-500 mb-4">
                Update product details. Upload new images if you want to replace
                the old ones.
              </p>

              <form className="space-y-3 max-h-[70vh] overflow-y-auto pr-1" onSubmit={handleUpdateProduct}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Brand *
                    </label>
                    <input
                      name="brand"
                      value={form.brand}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Category *
                    </label>
                    <input
                      name="category"
                      value={form.category}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-700">
                      Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      max="5"
                      min="0"
                      name="rating"
                      value={form.rating}
                      onChange={handleChangeForm}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChangeForm}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Replace Images (min 3)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full text-[11px] file:mr-2 file:rounded-full file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-black"
                  />
                  <p className="text-[10px] text-slate-500">
                    Leave empty to keep existing images. Upload at least 3 if
                    you want to replace.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!saving && !uploadingImages) {
                        setIsEditModalOpen(false);
                        resetForm();
                      }
                    }}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingImages}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-black disabled:opacity-70"
                  >
                    {saving || uploadingImages ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* -------------- EDIT STOCK MODAL -------------- */}
        {isStockModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-xs rounded-2xl bg-white shadow-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                Edit Stock
              </h2>
              <p className="text-[11px] text-slate-500 mb-3">
                Update available quantity for{" "}
                <span className="font-medium text-slate-900">
                  {activeProduct?.name}
                </span>
                .
              </p>

              <form className="space-y-3" onSubmit={handleUpdateStock}>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700">
                    Stock quantity
                  </label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    min="0"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => !updatingStock && setIsStockModalOpen(false)}
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStock}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-black disabled:opacity-70"
                  >
                    {updatingStock ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerProducts;
