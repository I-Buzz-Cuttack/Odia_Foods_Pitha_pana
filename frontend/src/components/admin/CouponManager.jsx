import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useCoupon } from "../../store/CouponContext";

const emptyForm = {
  code: "",
  description: "",
  discountType: "percent",
  discountValue: 0,
};

export default function CouponManager() {
  const {
    fetchAdminCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleVisibility,
  } = useCoupon();

  const [open, setOpen] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdminCoupons();
      setCoupons(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load coupons.");
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startEdit = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    });
    setMessage("");
    document.getElementById("coupon-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = {
      code: form.code,
      description: form.description,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      // preserve existing visibility on edit; new coupons start hidden until toggled on
      visible: editingId
        ? coupons.find((c) => c.id === editingId)?.visible || false
        : false,
    };
    try {
      if (editingId) {
        await updateCoupon(editingId, payload);
        setMessage("Coupon updated.");
      } else {
        await createCoupon(payload);
        setMessage("Coupon created.");
      }
      cancelEdit();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"? This can't be undone.`)) return;
    setBusyId(coupon.id);
    setMessage("");
    try {
      await deleteCoupon(coupon.id);
      if (editingId === coupon.id) cancelEdit();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not delete coupon.");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (coupon) => {
    setBusyId(coupon.id);
    try {
      await toggleVisibility(coupon.id);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not update visibility.");
    } finally {
      setBusyId(null);
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
            Coupon Management
          </h2>
          <p className="mt-2 text-sm text-ink/65">
            Customers only see a coupon after login when it's switched ON.
          </p>
        </div>
        <ChevronDown
          className={`shrink-0 text-temple transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
      <>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-temple/10 text-xs font-semibold uppercase tracking-wide text-ink/55">
              <th className="pb-2 pr-4">Code</th>
              <th className="pb-2 pr-4">Description</th>
              <th className="pb-2 pr-4">Discount</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink/50">
                  Loading coupons...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sindoor">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && coupons.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink/50">
                  No coupons yet.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-temple/5">
                  <td className="py-3 pr-4 font-medium text-ink">{coupon.code}</td>
                  <td className="py-3 pr-4 text-ink/70">{coupon.description}</td>
                  <td className="py-3 pr-4 text-ink/70">
                    {coupon.discountType === "percent"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      disabled={busyId === coupon.id}
                      onClick={() => handleToggle(coupon)}
                      className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                        coupon.visible
                          ? "border-sindoor bg-sindoor text-white hover:bg-sindoor"
                          : "border-temple/20 text-temple hover:bg-temple hover:text-white"
                      }`}
                    >
                      {coupon.visible ? "Visible (ON)" : "Hidden (OFF)"}
                    </button>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(coupon)}
                        className="rounded-md border border-temple/20 px-3 py-1.5 text-xs font-semibold text-temple hover:bg-temple hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busyId === coupon.id}
                        onClick={() => handleDelete(coupon)}
                        className="rounded-md border border-sindoor/30 px-3 py-1.5 text-xs font-semibold text-sindoor hover:bg-sindoor hover:text-white transition-colors disabled:opacity-50"
                      >
                        {busyId === coupon.id ? "Working..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div id="coupon-form" className="mt-8 border-t border-temple/10 pt-6">
        <h3 className="font-display text-lg font-bold text-temple">
          {editingId ? "Edit Coupon" : "Add Coupon"}
        </h3>
        <form onSubmit={submit} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="input"
              required
              placeholder="Coupon code, e.g. RAJA20"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
            <input
              className="input"
              placeholder="Description, e.g. 20% off for all Raja items"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="input"
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            >
              <option value="percent">Percentage off (%)</option>
              <option value="flat">Flat amount off (₹)</option>
            </select>
            <input
              className="input"
              required
              type="number"
              min="0"
              placeholder={
                form.discountType === "percent" ? "e.g. 20 for 20% off" : "e.g. 50 for ₹50 off"
              }
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            />
          </div>
          {message && (
            <p className="rounded-md bg-haldi/20 p-3 text-sm font-semibold text-temple">
              {message}
            </p>
          )}
          <div className="flex items-center gap-3">
            <button disabled={saving} className="btn-primary w-fit">
              {saving ? "Saving..." : editingId ? "Save Changes" : "Add Coupon"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-md border border-temple/20 px-4 py-2 text-sm font-semibold text-temple hover:bg-rice transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      </>
      )}
    </section>
  );
}