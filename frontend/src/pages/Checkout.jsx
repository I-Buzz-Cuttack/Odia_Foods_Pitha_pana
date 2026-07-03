import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../store/CartContext";
import { useCoupon } from "../store/CouponContext";
import { money } from "../utils/format";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { applyCoupon } = useCoupon();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const deliveryCharge = total > 499 ? 0 : 49;
  const preDiscountPayable = total + 30 + deliveryCharge;
  const discount = appliedCoupon?.discount || 0;
  const payable = Math.max(0, preDiscountPayable - discount);

  const handleApplyCoupon = async (event) => {
    event.preventDefault();
    if (!couponCode.trim()) return;
    setCouponStatus("checking");
    setCouponError("");
    try {
      const data = await applyCoupon(couponCode.trim(), preDiscountPayable);
      setAppliedCoupon(data);
      setCouponStatus("valid");
    } catch (error) {
      setAppliedCoupon(null);
      setCouponStatus("invalid");
      setCouponError(error?.response?.data?.message || "Invalid or expired coupon code");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponStatus(null);
    setCouponError("");
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    await api.post("/payments/razorpay-order", { amount: payable });
    await api.post("/orders", {
      items: items.map((item) => ({ ...item, product_id: item.id })),
      shippingAddress: address,
      paymentStatus: "Paid",
      couponCode: appliedCoupon?.code || null
    });
    clearCart();
    navigate("/orders");
  };

  return (
    <section className="container-page py-12">
      <h1 className="section-title">Secure Checkout</h1>
      <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-temple/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-temple">Shipping Address</h2>
          <textarea className="input mt-5 min-h-40" required value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Full name, phone, house number, locality, city, state, PIN" />
          <div className="mt-6 rounded-md bg-rice p-4 text-sm leading-6 text-ink/70">
            Razorpay integration is API-ready. If keys are not set in `.env`, checkout runs in safe demo mode and still creates the order.
          </div>
        </div>
        <aside className="h-fit rounded-lg border border-temple/10 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-bold text-temple">Payment</h2>
          <div className="mt-5 grid gap-3 text-sm">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex justify-between gap-3">
                <span>{item.name} x {item.quantity}</span>
                <span>{money(Number(item.price) * Number(item.quantity))}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-temple/10 pt-5">
            <p className="text-sm font-semibold text-ink/80">Coupon Code</p>
            {appliedCoupon ? (
              <div className="mt-2 flex items-center justify-between rounded-md bg-sindoor/10 px-3 py-2 text-sm">
                <span>
                  <span className="font-bold text-sindoor">{appliedCoupon.code}</span> applied — you saved {money(discount)}
                </span>
                <button type="button" className="text-xs font-semibold text-sindoor underline" onClick={removeCoupon}>
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                />
                <button type="button" className="btn-secondary" disabled={couponStatus === "checking"} onClick={handleApplyCoupon}>
                  {couponStatus === "checking" ? "Checking..." : "Apply"}
                </button>
              </div>
            )}
            {couponStatus === "invalid" && (
              <p className="mt-2 text-xs font-medium text-sindoor">{couponError}</p>
            )}
          </div>

          <div className="mt-5 space-y-2 border-t border-temple/10 pt-5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(preDiscountPayable)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sindoor">
                <span>Coupon discount</span>
                <span>-{money(discount)}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-between border-t border-temple/10 pt-5 text-xl font-bold">
            <span>Payable</span>
            <span>{money(payable)}</span>
          </div>
          <button disabled={loading || !items.length} className="btn-primary mt-6 w-full">{loading ? "Placing order..." : "Pay & Place Order"}</button>
        </aside>
      </form>
    </section>
  );
}