import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import api from "../../api/axios";

export default function SettingsManager() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    packaging_cost: 0,
    shipping_cost: 0,
    free_shipping_above: 0,
    gst_rate: 0,
    store_discount_percent: 0,
    store_discount_flat: 0,
  });

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/settings");
      setForm({
        packaging_cost: data.packaging_cost ?? 0,
        shipping_cost: data.shipping_cost ?? 0,
        free_shipping_above: data.free_shipping_above ?? 0,
        gst_rate: data.gst_rate ?? 0,
        store_discount_percent: data.store_discount_percent ?? 0,
        store_discount_flat: data.store_discount_flat ?? 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await api.put("/admin/settings", {
        packaging_cost: Number(form.packaging_cost),
        shipping_cost: Number(form.shipping_cost),
        free_shipping_above: Number(form.free_shipping_above),
        gst_rate: Number(form.gst_rate),
        store_discount_percent: Number(form.store_discount_percent),
        store_discount_flat: Number(form.store_discount_flat),
      });
      setMessage("Settings updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6 rounded-xl border border-temple/10 bg-white p-6 shadow-soft">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="font-display text-2xl font-bold text-temple">
            Shipping, Packaging & Discount Settings
          </h2>
          <p className="mt-2 text-sm text-ink/65">
            These fees and discounts apply automatically to every new order at checkout.
          </p>
        </div>
        <ChevronDown
          className={`shrink-0 text-temple transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {loading ? (
            <p className="mt-6 text-sm text-ink/50">Loading settings...</p>
          ) : (
            <form onSubmit={submit} className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block font-semibold text-ink/70">
                    Packaging Cost (₹)
                  </span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.packaging_cost}
                    onChange={(e) => setForm({ ...form, packaging_cost: e.target.value })}
                  />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-semibold text-ink/70">
                    Shipping Cost (₹)
                  </span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.shipping_cost}
                    onChange={(e) => setForm({ ...form, shipping_cost: e.target.value })}
                  />
                </label>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block font-semibold text-ink/70">
                    Free Shipping Above (₹)
                  </span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.free_shipping_above}
                    onChange={(e) => setForm({ ...form, free_shipping_above: e.target.value })}
                  />
                  <span className="mt-1 block text-xs text-ink/45">
                    Set to 0 to always charge shipping.
                  </span>
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-semibold text-ink/70">
                    GST Rate (%)
                  </span>
                                    <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.gst_rate}
                    onChange={(e) => setForm({ ...form, gst_rate: e.target.value })}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2 border-t border-temple/10 pt-4">
                <label className="text-sm">
                  <span className="mb-1 block font-semibold text-ink/70">
                    Store-wide Discount (%)
                  </span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.store_discount_percent}
                    onChange={(e) =>
                      setForm({ ...form, store_discount_percent: e.target.value })
                    }
                  />
                  <span className="mt-1 block text-xs text-ink/45">
                    Applied automatically to every order's item total.
                  </span>
                </label>
                <label className="text-sm">
                  <span className="mb-1 block font-semibold text-ink/70">
                    Store-wide Flat Discount (₹)
                  </span>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.store_discount_flat}
                    onChange={(e) =>
                      setForm({ ...form, store_discount_flat: e.target.value })
                    }
                  />
                  <span className="mt-1 block text-xs text-ink/45">
                    Flat ₹ off, added on top of the percentage discount.
                  </span>
                </label>
              </div>

              {message && (
                <p className="rounded-md bg-haldi/20 p-3 text-sm font-semibold text-temple">
                  {message}
                </p>
              )}
              {error && (
                <p className="rounded-md bg-sindoor/10 p-3 text-sm font-semibold text-sindoor">
                  {error}
                </p>
              )}

              <button disabled={saving} className="btn-primary w-fit">
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}