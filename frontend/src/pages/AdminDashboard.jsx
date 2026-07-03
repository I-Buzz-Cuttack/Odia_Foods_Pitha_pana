import {BarChart3,Boxes,CalendarDays,IndianRupee,TrendingUp,Users,} from "lucide-react";
import { useEffect, useState } from "react";
import {Area,AreaChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis,} from "recharts";
import api from "../api/axios";
import { money } from "../utils/format";
import InvoicePrintModal from "../components/InvoicePrintModal";
import ManageProducts from "../components/admin/ManageProducts";
import AddFoodItem from "../components/admin/AddFoodItem";
import CouponManager from "../components/admin/CouponManager";

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-temple/10 bg-white p-3 shadow-lg text-sm">
        <p className="font-semibold text-temple mb-1">{label}</p>
        <p className="text-ink/70">
          Sales:{" "}
          <span className="font-bold text-temple">
            ₹{Number(payload[0]?.value || 0).toLocaleString("en-IN")}
          </span>
        </p>
        <p className="text-ink/70">
          Orders:{" "}
          <span className="font-bold text-sindoor">
            {payload[1]?.value || 0}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  // const [notifications, setNotifications] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dateOrders, setDateOrders] = useState([]);
  const [dateLoading, setDateLoading] = useState(false);
  const [chartDays, setChartDays] = useState(1);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [couponVisible, setCouponVisible] = useState(false);


  const loadStats = () =>
    api
      .get("/admin/stats")
      .then(({ data }) => setStats(data))
      .catch(() => setStats(null));

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

  const loadChart = async (days) => {
    setChartLoading(true);
    try {
      const { data } = await api.get(`/admin/sales-chart?days=${days}`);
      setChartData(
        data.map((row) => ({
          date: new Date(row.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),
          sales: Number(row.sales),
          orders: Number(row.orders),
        })),
      );
    } catch {
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  };

    useEffect(() => {
      loadStats();
      loadChart(1);
      loadProducts();
    }, []);

  // useEffect(() => {
  //   const fetchNotifs = async () => {
  //     try {
  //       const { data } = await api.get("/admin/notifications");
  //       setNotifications(data);
  //     } catch {}
  //   };
  //   fetchNotifs();
  //   const id = setInterval(fetchNotifs, 15000);
  //   return () => clearInterval(id);
  // }, []);

  const update = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "name" ? { slug: makeSlug(value) } : {}),
    }));
  };

  const fetchOrdersByDate = async (date) => {
    if (!date) return;
    setDateLoading(true);
    setDateOrders([]);
    try {
      const { data } = await api.get(`/admin/orders-by-date?date=${date}`);
      setDateOrders(data);
    } catch {
      setDateOrders([]);
    } finally {
      setDateLoading(false);
    }
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
      await loadStats();
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
      await loadStats();
      await loadProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete food item.");
    } finally {
      setDeletingId(null);
    }
  };

  const cards = [
    [IndianRupee, "Sales", money(stats?.totalSales || 0)],
    [BarChart3, "Orders", stats?.orders || 0],
    [Users, "Users", stats?.users || 0],
    [Boxes, "Products", stats?.products || 0],
  ];

  const totalChartSales = chartData.reduce((s, d) => s + d.sales, 0);
  const totalChartOrders = chartData.reduce((s, d) => s + d.orders, 0);

  return (
    <section className="container-page py-12">
      <p className="font-semibold uppercase tracking-[0.2em] text-clay">
        Admin
      </p>
      <h1 className="section-title mt-2">Marketplace Dashboard</h1>

      {/* Stat Cards */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([Icon, label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-temple/10 bg-white p-6 shadow-sm"
          >
            <Icon className="text-sindoor" />
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-ink/55">
              {label}
            </p>
            <p className="mt-2 text-3xl font-bold text-temple">{value}</p>
          </div>
        ))}
      </div>

      {/* Coupon Management (admin only) */}
      <CouponManager />

      {/* Sales Chart + Orders by Date side by side */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Sales Chart */}
        <section className="rounded-xl border border-temple/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-sindoor" size={22} />
              <div>
                <h2 className="font-display text-xl font-bold text-temple">
                  Daily Sales
                </h2>
                <p className="text-xs text-ink/50 mt-0.5">Revenue over time</p>
              </div>
            </div>
            {/* Period toggle */}
            <div className="flex rounded-lg border border-temple/15 overflow-hidden text-sm font-semibold">
              {[1, 7, 15, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setChartDays(d);
                    loadChart(d);
                  }}
                  className={`px-4 py-1.5 transition-colors ${
                    chartDays === d
                      ? "bg-temple text-white"
                      : "bg-white text-ink/60 hover:bg-rice"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Summary pills */}
          <div className="mt-4 flex gap-4">
            <div className="rounded-lg bg-rice px-4 py-2 text-sm">
              <span className="text-ink/50">Total Sales </span>
              <span className="font-bold text-temple">
                ₹{totalChartSales.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="rounded-lg bg-rice px-4 py-2 text-sm">
              <span className="text-ink/50">Orders </span>
              <span className="font-bold text-sindoor">{totalChartOrders}</span>
            </div>
          </div>

          <div className="mt-5 h-56">
            {chartLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-ink/40">
                Loading chart...
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-ink/40">
                No sales data for this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#8B1A1A"
                        stopOpacity={0.18}
                      />
                      <stop offset="95%" stopColor="#8B1A1A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#8B1A1A"
                    strokeWidth={2.5}
                    fill="url(#salesGrad)"
                    dot={{ r: 3, fill: "#8B1A1A", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#c0392b"
                    strokeWidth={1.5}
                    fill="none"
                    strokeDasharray="4 3"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-3 flex gap-5 text-xs text-ink/50">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 rounded bg-temple"></span>
              Sales (₹)
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-5 rounded bg-sindoor border-dashed"
                style={{ borderTop: "2px dashed #c0392b", height: 0 }}
              ></span>
              Orders
            </span>
          </div>
        </section>

        {/* Orders by Date */}
        <section className="rounded-xl border border-temple/10 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-sindoor" size={22} />
            <div>
              <h2 className="font-display text-xl font-bold text-temple">
                Orders by Date
              </h2>
              <p className="text-xs text-ink/50 mt-0.5">
                Pick a date to see that day's orders
              </p>
            </div>
          </div>

          <div className="mt-4">
            <input
              type="date"
              className="input w-full"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                fetchOrdersByDate(e.target.value);
              }}
            />
          </div>

          <div className="mt-4 flex-1 overflow-y-auto max-h-64 pr-1">
            {!selectedDate && (
              <p className="text-sm text-ink/40 text-center mt-8">
                Select a date above
              </p>
            )}
            {dateLoading && (
              <p className="text-sm text-ink/40 text-center mt-8">Loading...</p>
            )}
            {selectedDate && !dateLoading && dateOrders.length === 0 && (
              <div className="text-center mt-8">
                <p className="text-2xl">📭</p>
                <p className="text-sm text-ink/40 mt-1">
                  No orders on{" "}
                  {new Date(selectedDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}
            {selectedDate && !dateLoading && dateOrders.length > 0 && (
              <div className="grid gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/70">
                  {dateOrders.length} order{dateOrders.length > 1 ? "s" : ""} on{" "}
                  {new Date(selectedDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                {dateOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-temple/20 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-temple">
                        {order.order_number}
                      </p>
                      <p className="text-sm font-bold text-temple">
                        ₹{Number(order.total).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p className="text-sm text-ink/60 mt-0.5">
                      👤 {order.customer_name}
                    </p>
                    <div className="mt-2 grid gap-0.5">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between text-sm text-ink/70"
                        >
                          <span>
                            🛍 {item.product_name}
                            {item.size ? ` (${item.size})` : ""}
                          </span>
                          <span>×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-ink/60">
                      {new Date(order.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="mt-3 flex items-center gap-2 rounded-lg border border-temple/20 bg-white px-3 py-1.5 text-xs font-semibold text-temple shadow-sm hover:bg-temple hover:text-white transition-colors"
                    >
                      🖨️ Print Invoice
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Recent Orders + Admin Features */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-xl border border-temple/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-temple">
            Recent Orders
          </h2>
          <div className="mt-5 grid gap-3">
            {stats?.recentOrders?.length ? (
              stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-temple/15 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-temple">
                      {order.order_number}
                    </span>
                    <span className="text-sm font-bold text-temple">
                      {money(order.total)}
                    </span>
                  </div>
                  <p className="text-sm text-ink/80 mt-1">
                    👤 {order.customer_name}
                  </p>
                  <div className="mt-2 grid gap-0.5">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs text-ink/70"
                      >
                        <span>
                          🛍 {item.product_name}
                          {item.size ? ` (${item.size})` : ""}
                        </span>
                        <span>
                          ×{item.quantity} — ₹{item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-ink/65">
                    📍 {order.shipping_address}
                  </p>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="mt-3 flex items-center gap-2 rounded-lg border border-temple/20 bg-white px-3 py-1.5 text-xs font-semibold text-temple shadow-sm hover:bg-temple hover:text-white transition-colors"
                  >
                    🖨️ Print Invoice
                  </button>
                </div>
              ))
            ) : (
              <p className="text-ink/65">No recent orders yet.</p>
            )}
          </div>
        </section>
        <section className="rounded-xl border border-temple/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-temple">
            Admin Features
          </h2>
          <div className="mt-5 grid gap-3 text-sm leading-6 text-ink/70">
            <p>
              Manage products through{" "}
              <code className="text-xs bg-rice px-1 rounded">
                /api/admin/products
              </code>{" "}
              create/update endpoints.
            </p>
            <p>
              Upload image URLs from Cloudinary or MinIO and store them on
              product records.
            </p>
            <p>
              View users, orders, reviews, sales analytics, and stock-ready
              product metadata.
            </p>
          </div>
        </section>
      </div>

      <ManageProducts
        products={products}
        productsLoading={productsLoading}
        productsError={productsError}
        deletingId={deletingId}
        onEdit={startEdit}
        onDelete={deleteProduct}
      />

      <AddFoodItem
        form={form}
        update={update}
        submitFood={submitFood}
        saving={saving}
        editingId={editingId}
        cancelEdit={cancelEdit}
        message={message}
      />
      {selectedOrder && (
        <InvoicePrintModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}