"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { type Product, type Aspect, CATEGORIES, money } from "@/lib/products";

interface ProductFormData {
  handle: string;
  title: string;
  price: string;
  category: string;
  color: string;
  sizes: string[];
  aspect: Aspect;
  description: string;
  frontImage: string;
  backImage: string;
}

const INITIAL_FORM: ProductFormData = {
  handle: "",
  title: "",
  price: "",
  category: "Apparel",
  color: "Black",
  sizes: ["S", "M", "L", "XL"],
  aspect: "large",
  description: "",
  frontImage: "",
  backImage: "",
};

const COMMON_SIZES = ["S", "M", "L", "XL", "2XL", "One size", "24L"];

export default function AdminDashboard() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Auth & Session
  const [sessionLoading, setSessionLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHandle, setEditingHandle] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(INITIAL_FORM);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Image upload states
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast / notification
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Check Session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/me");
        if (!res.ok) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setAdminUser(data.user?.username || "Admin");
      } catch {
        router.push("/admin/login");
      } finally {
        setSessionLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  // 2. Fetch Products
  const fetchProducts = async (page = currentPage, q = search, cat = selectedCategory) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        q,
        category: cat,
      });

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();

      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching products";
      showNotification(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionLoading) {
      fetchProducts(currentPage, search, selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading, currentPage, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, search, selectedCategory);
  };

  // 3. Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Open Modal for Create / Edit
  const openCreateModal = () => {
    setEditingHandle(null);
    setFormData(INITIAL_FORM);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingHandle(p.handle);
    setFormData({
      handle: p.handle,
      title: p.title,
      price: p.price.toString(),
      category: p.category,
      color: p.color,
      sizes: p.sizes || ["One size"],
      aspect: p.aspect,
      description: p.description || "",
      frontImage: p.frontImage || "",
      backImage: p.backImage || "",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Auto-generate slug when title changes in create mode
  const handleTitleChange = (val: string) => {
    setFormData((prev) => {
      if (!editingHandle) {
        const slug = val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return { ...prev, title: val, handle: slug };
      }
      return { ...prev, title: val };
    });
  };

  // Toggle size selection
  const toggleSize = (size: string) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      const updated = exists ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: updated.length > 0 ? updated : [size] };
    });
  };

  // Upload image to Cloudinary via /api/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, face: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (face === "front") setUploadingFront(true);
    else setUploadingBack(true);

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("handle", formData.handle || "item");
      uploadForm.append("face", face);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || "Upload failed");
      }

      setFormData((prev) => ({
        ...prev,
        [face === "front" ? "frontImage" : "backImage"]: data.url,
      }));

      showNotification(`Uploaded ${face} image to Cloudinary!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Cloudinary upload failed";
      showNotification(msg, "error");
    } finally {
      if (face === "front") setUploadingFront(false);
      else setUploadingBack(false);
    }
  };

  // Submit Form (Create or Edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        title: formData.title,
        handle: formData.handle,
        price: parseFloat(formData.price),
        category: formData.category,
        color: formData.color,
        sizes: formData.sizes,
        aspect: formData.aspect,
        description: formData.description,
        frontImage: formData.frontImage,
        backImage: formData.backImage,
      };

      if (isNaN(payload.price) || payload.price < 0) {
        throw new Error("Price must be a valid positive number");
      }

      const url = editingHandle ? `/api/products/${editingHandle}` : "/api/products";
      const method = editingHandle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      setIsModalOpen(false);
      showNotification(editingHandle ? "Product updated successfully!" : "New product created and live!");
      startTransition(() => {
        fetchProducts(currentPage, search, selectedCategory);
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Product
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/products/${deleteTarget.handle}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete product");
      }

      setDeleteTarget(null);
      showNotification(`Deleted "${deleteTarget.title}"`);
      fetchProducts(currentPage, search, selectedCategory);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      showNotification(msg, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex h-64 items-center justify-center font-mono text-xs text-white/50">
        Authenticating session...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-[100] border p-4 text-xs font-mono shadow-2xl transition-all duration-300 ${
            notification.type === "success"
              ? "border-emerald-500/50 bg-[#122216] text-emerald-300"
              : "border-red/50 bg-[#291111] text-red"
          }`}
        >
          {notification.text}
        </div>
      )}

      {/* Header & Quick stats */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">Products Catalog</h1>
          <p className="mt-1 text-xs font-mono text-white/50">
            Authenticated as <span className="text-white font-semibold">{adminUser}</span> • {total} Total items
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-white px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-black transition-all hover:bg-neutral-200 active:scale-95"
          >
            <span>+ Add Product</span>
          </button>
          <button
            onClick={handleLogout}
            className="border border-white/20 px-4 py-2.5 text-xs font-mono uppercase tracking-wider text-white/70 transition-colors hover:border-white hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Category & Search Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 border border-white/10 p-1 bg-[#141414]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                selectedCategory === cat
                  ? "bg-white text-black font-bold"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, color, tag..."
            className="w-full sm:w-64 border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white placeholder-white/30 focus:border-white focus:outline-none"
          />
          <button
            type="submit"
            className="border border-white/20 bg-[#1f1f1f] px-4 py-2 text-xs font-mono uppercase tracking-wider text-white hover:bg-white/10"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchProducts(1, "", selectedCategory);
              }}
              className="text-xs font-mono text-white/50 hover:text-white"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto border border-white/10 bg-[#121212]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-white/10 bg-black/40 text-white/50 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5">Item</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Price</th>
              <th className="px-4 py-3.5">Color & Sizes</th>
              <th className="px-4 py-3.5">Crop Aspect</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-white/40 font-mono">
                  Loading catalogue items...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-white/40 font-mono">
                  No products found. Click &quot;+ Add Product&quot; to create your first item!
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.handle} className="transition-colors hover:bg-white/[0.02]">
                  {/* Item Image + Details */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-white/5 border border-white/10">
                        {product.frontImage ? (
                          <Image
                            src={product.frontImage}
                            alt={product.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[8px] text-white/40">
                            NO IMG
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/product/${product.handle}`}
                          target="_blank"
                          className="font-bold text-white hover:underline underline-offset-4 flex items-center gap-1"
                        >
                          <span>{product.title}</span>
                          <span className="text-[10px] text-white/40">↗</span>
                        </Link>
                        <p className="text-[10px] text-white/40">{product.handle}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 border border-white/20 text-[10px] uppercase">
                      {product.category}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3 font-bold text-white">{money(product.price)}</td>

                  {/* Color & Sizes */}
                  <td className="px-4 py-3">
                    <p className="text-white/80">{product.color}</p>
                    <p className="text-[10px] text-white/40 truncate max-w-[150px]">
                      {product.sizes?.join(", ") || "—"}
                    </p>
                  </td>

                  {/* Aspect */}
                  <td className="px-4 py-3">
                    <span className="text-[10px] uppercase text-white/60 font-mono">
                      {product.aspect}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="px-2.5 py-1 border border-white/20 text-white hover:bg-white hover:text-black transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="px-2.5 py-1 border border-red/40 text-red hover:bg-red hover:text-white transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs font-mono">
          <p className="text-white/50">
            Page <span className="text-white">{currentPage}</span> of{" "}
            <span className="text-white">{totalPages}</span> ({total} items)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
              className="border border-white/20 px-3 py-1.5 uppercase hover:bg-white/10 disabled:opacity-30"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
              className="border border-white/20 px-3 py-1.5 uppercase hover:bg-white/10 disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl border border-white/20 bg-[#141414] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight">
                  {editingHandle ? "Edit Product" : "New Product"}
                </h2>
                <p className="text-xs text-white/50 font-mono">
                  {editingHandle
                    ? `Modifying: ${editingHandle}`
                    : "Add new product to live store and catalog"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-6 border border-red/40 bg-red/10 p-3 text-xs text-red font-mono">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Heavyweight Hoodie"
                    className="w-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
                  />
                </div>

                {/* Handle (Slug) */}
                <div>
                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                    Handle / Slug *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingHandle)}
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    placeholder="e.g. heavyweight-hoodie"
                    className="w-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Price */}
                <div>
                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="35.00"
                    className="w-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
                  >
                    <option value="Apparel">Apparel</option>
                    <option value="Bags">Bags</option>
                    <option value="Headwear">Headwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                    Color *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g. Black, Natural, Red"
                    className="w-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Sizes checkboxes */}
              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-2">
                  Sizes Available
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SIZES.map((size) => {
                    const selected = formData.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1 text-xs font-mono uppercase border transition-colors ${
                          selected
                            ? "border-white bg-white text-black font-bold"
                            : "border-white/20 text-white/60 hover:border-white/40"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Aspect Ratio Selection */}
              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                  Card Aspect Ratio (Layout Grid)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["large", "small", "square", "natural"] as Aspect[]).map((aspect) => (
                    <button
                      key={aspect}
                      type="button"
                      onClick={() => setFormData({ ...formData, aspect })}
                      className={`p-2 text-center text-xs font-mono uppercase border transition-colors ${
                        formData.aspect === aspect
                          ? "border-white bg-white text-black font-bold"
                          : "border-white/20 text-white/60 hover:border-white/40"
                      }`}
                    >
                      {aspect}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase text-white/60 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Editorial product description..."
                  className="w-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-white focus:outline-none"
                />
              </div>

              {/* CLOUDINARY IMAGE UPLOADS */}
              <div className="border-t border-white/10 pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-white">
                    Cloudinary Product Images
                  </h3>
                  <span className="text-[10px] font-mono text-white/40">
                    Auto-optimized via Cloudinary CDN
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front Image */}
                  <div className="border border-white/10 p-4 bg-black/40">
                    <label className="block text-[11px] font-mono uppercase text-white/70 mb-2">
                      Front Face Image
                    </label>

                    {formData.frontImage ? (
                      <div className="relative mb-3 h-36 w-full overflow-hidden bg-white/5 border border-white/10">
                        <Image
                          src={formData.frontImage}
                          alt="Front Preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="mb-3 flex h-36 w-full items-center justify-center border border-dashed border-white/20 text-[11px] font-mono text-white/30">
                        No image uploaded
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block w-full cursor-pointer border border-white/20 bg-[#1f1f1f] py-2 text-center text-xs font-mono uppercase text-white hover:bg-white/10">
                        {uploadingFront ? "Uploading to Cloudinary..." : "Upload Front Image"}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingFront}
                          onChange={(e) => handleFileUpload(e, "front")}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="url"
                        value={formData.frontImage}
                        onChange={(e) => setFormData({ ...formData, frontImage: e.target.value })}
                        placeholder="Or paste image URL"
                        className="w-full border border-white/10 bg-black/60 px-2 py-1.5 text-[11px] font-mono text-white placeholder-white/30 focus:border-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Back Image */}
                  <div className="border border-white/10 p-4 bg-black/40">
                    <label className="block text-[11px] font-mono uppercase text-white/70 mb-2">
                      Back / Alternate Face Image
                    </label>

                    {formData.backImage ? (
                      <div className="relative mb-3 h-36 w-full overflow-hidden bg-white/5 border border-white/10">
                        <Image
                          src={formData.backImage}
                          alt="Back Preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="mb-3 flex h-36 w-full items-center justify-center border border-dashed border-white/20 text-[11px] font-mono text-white/30">
                        No image uploaded
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block w-full cursor-pointer border border-white/20 bg-[#1f1f1f] py-2 text-center text-xs font-mono uppercase text-white hover:bg-white/10">
                        {uploadingBack ? "Uploading to Cloudinary..." : "Upload Back Image"}
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingBack}
                          onChange={(e) => handleFileUpload(e, "back")}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="url"
                        value={formData.backImage}
                        onChange={(e) => setFormData({ ...formData, backImage: e.target.value })}
                        placeholder="Or paste image URL"
                        className="w-full border border-white/10 bg-black/60 px-2 py-1.5 text-[11px] font-mono text-white placeholder-white/30 focus:border-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-white/20 px-4 py-2.5 text-xs font-mono uppercase text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="bg-white px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-black hover:bg-neutral-200 disabled:opacity-50"
                >
                  {formSubmitting
                    ? "Saving to Catalog..."
                    : editingHandle
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-red/40 bg-[#171010] p-6 shadow-2xl">
            <h3 className="text-base font-bold uppercase tracking-tight text-white mb-2">
              Confirm Delete Product
            </h3>
            <p className="text-xs font-mono text-white/70 mb-6">
              Are you sure you want to permanently delete &quot;{deleteTarget.title}&quot; (
              {deleteTarget.handle}) from the store catalog?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="border border-white/20 px-4 py-2 text-xs font-mono uppercase text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="bg-red px-5 py-2 text-xs font-mono font-bold uppercase text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
