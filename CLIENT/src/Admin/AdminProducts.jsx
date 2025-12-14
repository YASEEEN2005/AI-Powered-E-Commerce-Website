import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  Filter,
  Star,
  Image as ImageIcon,
  Loader2,
  IndianRupee,
  Package,
  Tag,
  Store,
  ChevronDown,
  Layers,
  Pencil,
  Trash2,
  Check,
  X as XIcon,
} from "lucide-react";
import Modal from "../componets/Modal";

const api = import.meta.env.VITE_BACKEND_API;

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    rating: "",
    stock: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${api}/api/products`);

        const data = res.data?.data || res.data || [];
        if (!Array.isArray(data)) {
          setProducts([]);
          setFiltered([]);
          return;
        }

        setProducts(data);
        setFiltered(data);
      } catch (err) {
        console.error("Fetch products error:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load products";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const uniqueCategories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const uniqueBrands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set);
  }, [products]);

  const totalProducts = products.length;
  const totalCategories = uniqueCategories.length;
  const totalBrands = uniqueBrands.length;

  const avgPrice = useMemo(() => {
    if (!products.length) return 0;
    const sum = products.reduce(
      (acc, p) => acc + Number(p.price || 0),
      0
    );
    return Math.round(sum / products.length);
  }, [products]);

  const applyFilters = (value, cat = categoryFilter, brand = brandFilter) => {
    const v = value.toLowerCase();

    let list = [...products];

    if (v.trim()) {
      list = list.filter((p) => {
        const name = String(p.name || "").toLowerCase();
        const brandName = String(p.brand || "").toLowerCase();
        const category = String(p.category || "").toLowerCase();
        const pid = String(p.product_id || p.id || p._id || "").toLowerCase();
        const sid = String(p.seller_id || "").toLowerCase();
        return (
          name.includes(v) ||
          brandName.includes(v) ||
          category.includes(v) ||
          pid.includes(v) ||
          sid.includes(v)
        );
      });
    }

    if (cat !== "all") {
      list = list.filter((p) => String(p.category || "") === cat);
    }
    if (brand !== "all") {
      list = list.filter((p) => String(p.brand || "") === brand);
    }

    setFiltered(list);
  };

  const handleSearch = (value) => {
    setSearch(value);
    applyFilters(value);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    applyFilters(search, value, brandFilter);
  };

  const handleBrandChange = (value) => {
    setBrandFilter(value);
    applyFilters(search, categoryFilter, value);
  };

  const getPrimaryImage = (product) => {
    if (!product.images || !Array.isArray(product.images)) return null;
    return product.images[0] || null;
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setIsEditing(false);
    setEditForm({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      price: product.price != null ? product.price : "",
      rating: product.rating != null ? product.rating : "",
      stock: product.stock != null ? product.stock : "",
      description: product.description || "",
    });
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setIsEditing(false);
    setSaving(false);
    setDeleting(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getProductIdForApi = (product) => {
    return product.product_id || product.id || product._id;
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct) return;
    const productId = getProductIdForApi(selectedProduct);
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: editForm.name,
        brand: editForm.brand,
        category: editForm.category,
        price: Number(editForm.price) || 0,
        rating: Number(editForm.rating) || 0,
        stock: Number(editForm.stock) || 0,
        description: editForm.description,
      };

      const res = await axios.put(
        `${api}/api/products/${productId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = res.data?.data || res.data;
      const updatedProduct = updated || {
        ...selectedProduct,
        ...payload,
      };

      setProducts((prev) =>
        prev.map((p) =>
          String(getProductIdForApi(p)) === String(productId)
            ? { ...p, ...updatedProduct }
            : p
        )
      );
      setFiltered((prev) =>
        prev.map((p) =>
          String(getProductIdForApi(p)) === String(productId)
            ? { ...p, ...updatedProduct }
            : p
        )
      );

      setSelectedProduct((prev) =>
        prev ? { ...prev, ...updatedProduct } : prev
      );
      setIsEditing(false);
      toast.success("Product updated successfully");
    } catch (err) {
      console.error("Update product error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update product";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    const productId = getProductIdForApi(selectedProduct);
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }

    const ok = window.confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    try {
      setDeleting(true);

      await axios.delete(`${api}/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((prev) =>
        prev.filter(
          (p) => String(getProductIdForApi(p)) !== String(productId)
        )
      );
      setFiltered((prev) =>
        prev.filter(
          (p) => String(getProductIdForApi(p)) !== String(productId)
        )
      );

      toast.success("Product deleted successfully");
      closeProductModal();
    } catch (err) {
      console.error("Delete product error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to delete product";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-5 md:py-6">
        <div className="mb-4 md:mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Catalog Overview
            </p>
            <h2 className="text-lg md:text-xl font-semibold text-slate-900">
              Products on SwiftCart
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              View, filter, edit and manage all products in the marketplace.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name, brand, seller or ID"
                className="w-full rounded-full border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {filtered.length} products in view
            </div>
          </div>
        </div>

        <div className="mb-4 md:mb-5 grid gap-3 md:gap-4 md:grid-cols-3">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-slate-50 rounded-2xl p-4 shadow-lg shadow-slate-900/20 border border-slate-700/70 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-300">
                Total products
              </p>
              <div className="h-8 w-8 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-600">
                <Package size={16} className="text-slate-50" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {totalProducts}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Avg. price:{" "}
              <span className="text-slate-100">
                ₹{avgPrice.toLocaleString()}
              </span>
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">
                Categories
              </p>
              <Layers size={16} className="text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {totalCategories}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Product groups in your catalog.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-500">
                Brands
              </p>
              <Store size={16} className="text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {totalBrands}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Different brands selling on SwiftCart.
            </p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Layers size={12} className="text-slate-400" />
              Category
            </span>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Tag size={13} className="text-slate-400" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full appearance-none rounded-full border border-slate-200 bg-white pl-8 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              >
                <option value="all">All categories</option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Store size={12} className="text-slate-400" />
              Brand
            </span>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Package size={13} className="text-slate-400" />
              </div>
              <select
                value={brandFilter}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full appearance-none rounded-full border border-slate-200 bg-white pl-8 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
              >
                <option value="all">All brands</option>
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between sm:justify-end gap-2 text-[11px] text-slate-500">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-slate-50 font-medium">
              <Filter size={13} />
              Filters
            </div>
            <span className="hidden sm:inline">
              Showing {filtered.length} of {products.length} products
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-900">
              Product list
            </p>
            <span className="text-[11px] text-slate-500 sm:hidden">
              {filtered.length} / {products.length}
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin" size={16} />
              Loading products...
            </div>
          ) : filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      ID
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Product
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Category
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Brand
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Price
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Rating
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium">
                      Stock
                    </th>
                    <th className="py-2 pr-3 text-slate-500 font-medium text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p._id || p.product_id || p.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="py-2 pr-3 text-slate-800">
                        {p.product_id ||
                          p.id ||
                          String(p._id || "").slice(-6)}
                      </td>
                      <td className="py-2 pr-3 text-slate-800 max-w-[220px]">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {getPrimaryImage(p) ? (
                              <img
                                src={getPrimaryImage(p)}
                                alt={p.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon
                                size={14}
                                className="text-slate-400"
                              />
                            )}
                          </div>
                          <span className="line-clamp-2">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {p.category || "-"}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {p.brand || "-"}
                      </td>
                      <td className="py-2 pr-3 text-slate-800">
                        ₹{(p.price || 0).toLocaleString()}
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        <div className="flex items-center gap-1">
                          <Star
                            size={14}
                            className="text-amber-400 fill-amber-400"
                          />
                          <span>{p.rating || 0}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-slate-700">
                        {p.stock != null ? p.stock : "-"}
                      </td>
                      <td className="py-2 pl-3 text-right">
                        <button
                          onClick={() => openProductModal(p)}
                          className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No products found.
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeProductModal}
        title={
          selectedProduct
            ? isEditing
              ? "Edit product"
              : selectedProduct.name
            : "Product details"
        }
        subtitle={
          selectedProduct
            ? `ID: ${
                selectedProduct.product_id ||
                selectedProduct.id ||
                (selectedProduct._id
                  ? String(selectedProduct._id).slice(-6)
                  : "")
              }`
            : ""
        }
        maxWidth="max-w-3xl"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Store size={12} className="text-slate-400" />
                <span>Seller ID: {selectedProduct.seller_id || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                    disabled={saving || deleting}
                  >
                    <XIcon size={12} />
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                )}
                <button
                  onClick={handleDeleteProduct}
                  disabled={deleting}
                  className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 disabled:opacity-60"
                >
                  {deleting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,_1.2fr)_minmax(0,_1.5fr)] gap-4">
              <div className="flex flex-col gap-3">
                <div className="w-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden min-h-[180px]">
                  {getPrimaryImage(selectedProduct) ? (
                    <img
                      src={getPrimaryImage(selectedProduct)}
                      alt={selectedProduct.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImageIcon size={32} className="text-slate-400" />
                  )}
                </div>

                {selectedProduct.images &&
                  Array.isArray(selectedProduct.images) &&
                  selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {selectedProduct.images.map((img, index) => (
                        <div
                          key={index}
                          className="h-14 w-14 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0"
                        >
                          <img
                            src={img}
                            alt={`thumb-${index}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">
                          Name
                        </span>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">
                          Brand
                        </span>
                        <input
                          type="text"
                          name="brand"
                          value={editForm.brand}
                          onChange={handleEditChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">
                          Category
                        </span>
                        <input
                          type="text"
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">
                          Price
                        </span>
                        <input
                          type="number"
                          name="price"
                          value={editForm.price}
                          onChange={handleEditChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">
                          Rating
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          name="rating"
                          value={editForm.rating}
                          onChange={handleEditChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-500">
                          Stock
                        </span>
                        <input
                          type="number"
                          name="stock"
                          value={editForm.stock}
                          onChange={handleEditChange}
                          className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-slate-500">
                        Description
                      </span>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-slate-900/80"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={handleSaveChanges}
                        disabled={saving || deleting}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        Save changes
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-slate-400" />
                        <span>
                          Brand:{" "}
                          <span className="font-medium text-slate-900">
                            {selectedProduct.brand || "-"}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-slate-400" />
                        <span>
                          Category:{" "}
                          <span className="font-medium text-slate-900">
                            {selectedProduct.category || "-"}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee size={14} className="text-slate-400" />
                        <span>
                          Price:{" "}
                          <span className="font-medium text-slate-900">
                            ₹{(selectedProduct.price || 0).toLocaleString()}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star
                          size={14}
                          className="text-amber-400 fill-amber-400"
                        />
                        <span>
                          Rating:{" "}
                          <span className="font-medium text-slate-900">
                            {selectedProduct.rating || 0}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Store size={14} className="text-slate-400" />
                        <span>
                          Seller ID:{" "}
                          <span className="font-medium text-slate-900">
                            {selectedProduct.seller_id || "-"}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-slate-400" />
                        <span>
                          Stock:{" "}
                          <span className="font-medium text-slate-900">
                            {selectedProduct.stock != null
                              ? selectedProduct.stock
                              : "-"}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-900 mb-1">
                        Description
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {selectedProduct.description ||
                          "No description available."}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminProducts;
