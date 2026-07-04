import { useEffect, useState } from "react";
import api from "../api/axios";
import CouponManager from "../components/admin/CouponManager";
import SettingsManager from "../components/admin/SettingsManager";
import ManageProducts from "../components/admin/ManageProducts";
import AddFoodItem from "../components/admin/AddFoodItem";

const today = new Date().toISOString().slice(0, 10);
const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

const initialForm = {
  name: "",
  slug: "",
  category: "Pitha",
  short_description: "",
  description: "",
  cultural_significance: "",
  ingredients: "",
  preparation: "",
  region_origin: "Odisha",
  nutrition: "",
  storage: "",
  shelf_life_days: 7,
  price: "",
  price_unit: "Per Piece",
  availability: "In Stock",
  sizes: "250g, 500g",
  image_url: "",
  festival_tag: "",
  stock: 20,
  manufacturing_date: today,
  expiry_date: nextWeek,
};

const makeSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function AdminManage() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadProducts = () => {
    setProductsLoading(true);
    setProductsError("");
    return api
      .get("/admin/products")
      .then(({ data }) => setProducts(data))
      .catch((error) => {
        setProducts([]);
        setProductsError(
          error.response?.data?.message ||
            error.message ||
            "Could not load products."
        );
      })
      .finally(() => setProductsLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "name" ? { slug: makeSlug(value) } : {}),
    }));
  };

  const submitFood = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = {
      ...form,
      shelf_life_days: Number(form.shelf_life_days),
      price: Number(form.price),
      stock: Number(form.stock),
    };
    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        setMessage("Food item updated successfully.");
      } else {
        await api.post("/admin/products", payload);
        setMessage("Food item added successfully.");
      }
      setForm(initialForm);
      setEditingId(null);
      await loadProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save food item.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      slug: product.slug || "",
      category: product.category || "Pitha",
      short_description: product.short_description || "",
      description: product.description || "",
      cultural_significance: product.cultural_significance || "",
      ingredients: product.ingredients || "",
      preparation: product.preparation || "",
      region_origin: product.region_origin || "Odisha",
      nutrition: product.nutrition || "",
      storage: product.storage || "",
      shelf_life_days: product.shelf_life_days ?? 7,
      price: product.price ?? "",
      price_unit: product.price_unit || "Per Piece",
      availability: product.availability || "In Stock",
      sizes: product.sizes || "",
      image_url: product.image_url || "",
      festival_tag: product.festival_tag || "",
      stock: product.stock ?? 20,
      manufacturing_date: product.manufacturing_date
        ? String(product.manufacturing_date).slice(0, 10)
        : today,
      expiry_date: product.expiry_date
        ? String(product.expiry_date).slice(0, 10)
        : nextWeek,
    });
    setMessage("");
    document.getElementById("add-food-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(initialForm);
    setMessage("");
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This can't be undone.`)) return;
    setDeletingId(product.id);
    setMessage("");
    try {
      await api.delete(`/admin/products/${product.id}`);
      setMessage(`"${product.name}" was deleted.`);
      if (editingId === product.id) cancelEdit();
      await loadProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete food item.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="container-page py-12">
      <p className="font-semibold uppercase tracking-[0.2em] text-clay">Admin</p>
      <h1 className="section-title mt-2">Manage Store</h1>

      {/* Coupon Management */}
      <CouponManager />

      {/* Shipping & Packaging Settings */}
      <SettingsManager />

      {/* Manage existing products */}
      <ManageProducts
        products={products}
        productsLoading={productsLoading}
        productsError={productsError}
        deletingId={deletingId}
        onEdit={startEdit}
        onDelete={deleteProduct}
      />

      {/* Add / edit a product */}
      <AddFoodItem
        form={form}
        update={update}
        submitFood={submitFood}
        saving={saving}
        editingId={editingId}
        cancelEdit={cancelEdit}
        message={message}
      />
    </section>
  );
}