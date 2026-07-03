import { ArrowRight, BadgeCheck, Leaf, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import heroImage from "../assets/odisha-pitha-hero.png";
import LoadingGrid from "../components/LoadingGrid";
import ProductCard from "../components/ProductCard";
import { fallbackProducts } from "../data/fallbackProducts";
import { useAuth } from "../store/AuthContext";
import { useCoupon } from "../store/CouponContext";

const festivals = ["Raja", "Rath Yatra", "Makar Sankranti", "Manabasa Gurubar", "Pana Sankranti"];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { coupons } = useCoupon();

  useEffect(() => {
    api
      .get("/products/featured")
      .then(({ data }) => setProducts(data))
      .catch(() => setProducts(fallbackProducts.slice(0, 8)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {!isAdmin && coupons.length > 0 && (
        <div className="bg-haldi text-ink py-3 font-semibold overflow-hidden whitespace-nowrap">
          <div className="inline-flex gap-12 animate-marquee">
            {[...coupons, ...coupons].map((c, i) => (
              <span key={`${c.id}-${i}`}>
                🎉 Use code <span className="font-bold">{c.code}</span>
                {c.description ? ` — ${c.description}` : ""}
              </span>
            ))}
          </div>
        </div>
      )}
      <section className="relative isolate min-h-[720px] overflow-hidden bg-temple text-white">
        <img src={heroImage} alt="Traditional Odisha Pithas and Panas" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-temple via-temple/80 to-temple/20" />
        <div className="motif-border absolute inset-0 -z-10 opacity-30" />
        <div className="container-page flex min-h-[720px] items-center py-16">
          <div className="max-w-2xl animate-floatIn">
            <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              Authentic Odisha traditional foods
            </span>
            <h1 className="mt-7 font-display text-5xl font-bold leading-tight md:text-7xl">Odisha Pitha & Pana Marketplace</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/82">
              Discover, learn, and order fresh-batch Arisa, Enduri, Poda Pitha, Bela Pana, Tanka Torani, and more from Odisha's culinary heritage.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/catalog" className="btn-primary bg-haldi text-ink hover:bg-white">
                Shop Pithas <ArrowRight size={18} />
              </Link>
              <Link to="/knowledge" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white hover:text-temple">
                Explore Heritage
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page -mt-12 relative z-10 grid gap-4 md:grid-cols-3">
        {[
          [BadgeCheck, "Fresh-batch verified", "Manufacturing and expiry details on every product."],
          [Leaf, "Cultural encyclopedia", "Learn origin, festival use, ingredients, and preparation."],
          [Truck, "Tracked delivery", "Cart, checkout, invoices, and order history included."]
        ].map(([Icon, title, text]) => (
          <div key={title} className="rounded-lg border border-temple/10 bg-white p-6 shadow-soft">
            <Icon className="text-sindoor" />
            <h3 className="mt-4 font-display text-xl font-bold text-temple">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/70">{text}</p>
          </div>
        ))}
      </section>

      <section className="container-page py-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-clay">Featured products</p>
            <h2 className="section-title mt-2">Popular Pithas and Panas</h2>
          </div>
          <Link to="/catalog" className="btn-secondary">View full catalog</Link>
        </div>
        <div className="mt-8">{loading ? <LoadingGrid /> : <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>}</div>
      </section>

      <section className="bg-white py-20">
        <div className="container-page">
          <h2 className="section-title">Festival Special Collections</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {festivals.map((festival) => (
              <Link
                key={festival}
                to={`/catalog?festival=${encodeURIComponent(festival)}`}
                className="group rounded-lg border border-temple/10 bg-rice p-5 transition hover:-translate-y-1 hover:border-temple/30 hover:shadow-soft"
              >
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-clay">Collection</span>
                <h3 className="mt-3 font-display text-2xl font-bold text-temple">{festival}</h3>
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sindoor">
                  Explore <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}