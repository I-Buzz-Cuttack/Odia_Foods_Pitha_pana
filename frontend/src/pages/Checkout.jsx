import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../store/CartContext";
import { useCoupon } from "../store/CouponContext";
import { money } from "../utils/format";
import UpiQrModal from "../components/UpiQrModal";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { applyCoupon } = useCoupon();
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // razorpay | gpay | phonepe
  const [showQrModal, setShowQrModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [settings, setSettings] = useState({
    packaging_cost: 0,
    shipping_cost: 0,
    free_shipping_above: 0,
    gst_rate: 0,
    store_discount_percent: 0,
    store_discount_flat: 0,
  });

  useEffect(() => {
    api
      .get("/settings")
      .then(({ data }) => setSettings(data))
      .catch(() => {});
  }, []);

  const packagingCost = Number(settings.packaging_cost) || 0;
  const freeShippingAbove = Number(settings.free_shipping_above) || 0;
  const shippingCost =
    freeShippingAbove > 0 && total > freeShippingAbove
      ? 0
      : Number(settings.shipping_cost) || 0;
  const gstRate = (Number(settings.gst_rate) || 0) / 100;

  const storeDiscountPercent = Number(settings.store_discount_percent) || 0;
  const storeDiscountFlat = Number(settings.store_discount_flat) || 0;
  const storeDiscount = (total * storeDiscountPercent) / 100 + storeDiscountFlat;

  const couponDiscount = appliedCoupon?.discount || 0;
  const discount = Math.max(0, Math.min(couponDiscount + storeDiscount, total));
  const taxableAmount = Math.max(0, total - discount);
  const tax = taxableAmount * gstRate;
  const payable = taxableAmount + tax + shippingCost + packagingCost;
  // amount the coupon percentage/flat discount is calculated against
  const preDiscountPayable = total + packagingCost + shippingCost;

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
      setCouponError(
        error?.response?.data?.message || "Invalid or expired coupon code",
      );
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponStatus(null);
    setCouponError("");
  };

  const finalizeOrder = async (paymentStatus) => {
    await api.post("/orders", {
      items: items.map((item) => ({ ...item, product_id: item.id })),
      shippingAddress: address,
      paymentStatus,
      couponCode: appliedCoupon?.code || null,
    });
    clearCart();
    navigate("/orders");
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data: orderData } = await api.post("/payments/razorpay-order", {
        amount: payable,
      });

      if (paymentMethod === "gpay" || paymentMethod === "phonepe") {
        // Show the QR modal instead of completing instantly
        setShowQrModal(true);
        setLoading(false);
        return;
      }

      if (orderData.provider === "demo") {
        await api.post("/payments/verify", { provider: "demo" });
        await finalizeOrder("Paid");
        return;
      }

      const rzp = new window.Razorpay({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        order_id: orderData.order.id,
        name: "Odisha Pitha Marketplace",
        description: "Order Payment",
        handler: async (response) => {
          const { data: verify } = await api.post("/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verify.verified) {
            await finalizeOrder("Paid");
          } else {
            alert("Payment verification failed. Please try again.");
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#8B1E3F" },
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const confirmQrPayment = async () => {
    setShowQrModal(false);
    await api.post("/payments/verify", { provider: "demo" });
    await finalizeOrder("Paid");
  };

  const cancelQrPayment = () => {
    setShowQrModal(false);
  };

  return (
    <section className="container-page py-12">
      <h1 className="section-title">Secure Checkout</h1>
      <form
        onSubmit={placeOrder}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
      >
        <div className="rounded-lg border border-temple/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-temple">
            Shipping Address
          </h2>
          <textarea
            className="input mt-5 min-h-40"
            required
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Full name, phone, house number, locality, city, state, PIN"
          />
          {/* <div className="mt-6 rounded-md bg-rice p-4 text-sm leading-6 text-ink/70">
            Razorpay integration is API-ready. If keys are not set in `.env`,
            checkout runs in safe demo mode and still creates the order.
          </div> */}
        </div>
        <aside className="h-fit rounded-lg border border-temple/10 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-bold text-temple">
            Payment
          </h2>
          <div className="mt-5 grid gap-3 text-sm">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="flex justify-between gap-3"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>{money(Number(item.price) * Number(item.quantity))}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-temple/10 pt-5">
            <p className="text-sm font-semibold text-ink/80 mb-3">
              Choose payment method
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "razorpay", label: "Cards / UPI (Razorpay)" },
                { id: "gpay", label: "Google Pay" },
                { id: "phonepe", label: "PhonePe" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`rounded-md border px-3 py-3 text-xs font-semibold ${
                    paymentMethod === opt.id
                      ? "border-sindoor bg-sindoor/10 text-sindoor"
                      : "border-temple/10 text-ink/70"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {paymentMethod !== "razorpay" && (
              <p className="mt-2 text-xs text-ink/60">
                Demo mode: {paymentMethod === "gpay" ? "Google Pay" : "PhonePe"}{" "}
                simulates instant success.
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-temple/10 pt-5">
            <p className="text-sm font-semibold text-ink/80">Coupon Code</p>
            {appliedCoupon ? (
              <div className="mt-2 flex items-center justify-between rounded-md bg-sindoor/10 px-3 py-2 text-sm">
                <span>
                  <span className="font-bold text-sindoor">
                    {appliedCoupon.code}
                  </span>{" "}
                  applied — you saved {money(discount)}
                </span>
                <button
                  type="button"
                  className="text-xs font-semibold text-sindoor underline"
                  onClick={removeCoupon}
                >
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
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={couponStatus === "checking"}
                  onClick={handleApplyCoupon}
                >
                  {couponStatus === "checking" ? "Checking..." : "Apply"}
                </button>
              </div>
            )}
            {couponStatus === "invalid" && (
              <p className="mt-2 text-xs font-medium text-sindoor">
                {couponError}
              </p>
            )}
          </div>

          <div className="mt-5 space-y-2 border-t border-temple/10 pt-5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(total)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Packaging</span>
              <span>{money(packagingCost)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "Free" : money(shippingCost)}</span>
            </div>
            {storeDiscount > 0 && (
              <div className="flex justify-between text-sindoor">
                <span>Store discount</span>
                <span>-{money(storeDiscount)}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sindoor">
                <span>Coupon discount</span>
                <span>-{money(couponDiscount)}</span>
              </div>
            )}
            {gstRate > 0 && (
              <div className="flex justify-between text-ink/70">
                <span>GST ({settings.gst_rate}%)</span>
                <span>{money(tax)}</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-between border-t border-temple/10 pt-5 text-xl font-bold">
            <span>Payable</span>
            <span>{money(payable)}</span>
          </div>
          <button
            disabled={loading || !items.length}
            className="btn-primary mt-6 w-full"
          >
            {loading ? "Placing order..." : "Pay & Place Order"}
          </button>
        </aside>
      </form>
      {showQrModal && (
        <UpiQrModal
          amount={payable.toFixed(2)}
          method={paymentMethod}
          upiId="yourname@okaxis"
          onConfirm={confirmQrPayment}
          onCancel={cancelQrPayment}
        />
      )}
    </section>
  );
}
