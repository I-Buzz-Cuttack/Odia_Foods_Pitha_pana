import { FileText, PackageSearch } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { dateText, money } from "../utils/format";
import { useAuth } from "../store/AuthContext";
import InvoicePrintModal from "../components/InvoicePrintModal";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get("/orders").then(({ data }) => setOrders(data)).catch(() => setOrders([]));
  }, []);

  const loadInvoice = async (id) => {
    const { data } = await api.get(`/orders/${id}/invoice`);
    setInvoice(data);
    setInvoiceOrder({
      ...data.order,
      items: data.items,
      customer_name: user?.name || "Customer",
    });
  };

  return (
    <section className="container-page py-12">
      <h1 className="section-title">Order History & Tracking</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="grid gap-4">
          {orders.length ? orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-temple/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-temple">{order.order_number}</h2>
                  <p className="text-sm text-ink/60">{dateText(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{money(order.total)}</p>
                  <p className="text-sm text-sindoor">{order.status} · {order.payment_status}</p>
                </div>
              </div>
              <button onClick={() => loadInvoice(order.id)} className="btn-secondary mt-4 py-2"><FileText size={16} /> View Invoice</button>
            </article>
          )) : (
            <div className="rounded-lg border border-temple/10 bg-white p-10 text-center">
              <PackageSearch className="mx-auto text-clay" size={40} />
              <h2 className="mt-4 font-display text-2xl font-bold text-temple">No orders yet</h2>
              <p className="mt-2 text-ink/70">Your tracked Pitha and Pana orders will appear here.</p>
            </div>
          )}
        </div>
        <aside className="h-fit rounded-lg border border-temple/10 bg-white p-6 shadow-soft">
          <h2 className="font-display text-2xl font-bold text-temple">Invoice</h2>
          {invoice ? (
            <div className="mt-5 text-sm">
              <p className="font-bold">{invoice.invoiceNumber}</p>
              <p className="mt-1 text-ink/60">{invoice.order.order_number}</p>
               <div className="mt-5 grid gap-3">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3">
                    <span>{item.product_name} x {item.quantity}</span>
                    <span>{money(Number(item.price) * Number(item.quantity))}</span>
                  </div>
                ))}
              </div>
              {Number(invoice.order.discount) > 0 && (
                <div className="mt-3 flex justify-between text-sindoor">
                  <span>Discount{invoice.order.coupon_code ? ` (${invoice.order.coupon_code})` : ""}</span>
                  <span>- {money(invoice.order.discount)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between text-ink/70">
                <span>Packaging</span>
                <span>{money(invoice.order.packaging_cost)}</span>
              </div>
              <div className="mt-2 flex justify-between text-ink/70">
                <span>Shipping</span>
                <span>{Number(invoice.order.shipping_cost) === 0 ? "Free" : money(invoice.order.shipping_cost)}</span>
              </div>
              <div className="mt-2 flex justify-between text-ink/70">
                <span>GST</span>
                <span>{money(invoice.order.tax)}</span>
              </div>
              <div className="mt-5 flex justify-between border-t border-temple/10 pt-5 text-lg font-bold">
                <span>Total</span>
                <span>{money(invoice.order.total)}</span>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="btn-secondary mt-5 w-full py-2"
              >
                <FileText size={16} /> Open Full Invoice / Print
              </button>
            </div>
          ) : (
            <p className="mt-4 text-ink/65">Select an order to preview invoice details.</p>
          )}
        </aside>
      </div>

      {showModal && invoiceOrder && (
        <InvoicePrintModal order={invoiceOrder} onClose={() => setShowModal(false)} />
      )}
    </section>
  );
}