export default function UpiQrModal({ amount, method, upiId = "yourname@okaxis", onConfirm, onCancel }) {
  const upiUri = `upi://pay?pa=${upiId}&pn=Odisha%20Pitha%20Marketplace&am=${amount}&cu=INR&tn=Order%20Payment`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
        <h2 className="font-display text-xl font-bold text-temple">
          Pay with {method === "gpay" ? "Google Pay" : "PhonePe"}
        </h2>
        <p className="mt-1 text-sm text-ink/60">Scan this QR code to pay</p>

        <img src={qrImageUrl} alt="UPI QR Code" className="mx-auto mt-4 h-56 w-56 rounded-md border border-temple/10" />

        <p className="mt-4 text-2xl font-bold text-temple">₹{amount}</p>
        <p className="mt-1 text-xs text-ink/50">Paying to: {upiId}</p>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-primary flex-1">
            I've Paid
          </button>
        </div>
        <p className="mt-3 text-[11px] text-ink/40">Demo mode — no real payment is processed.</p>
      </div>
    </div>
  );
}