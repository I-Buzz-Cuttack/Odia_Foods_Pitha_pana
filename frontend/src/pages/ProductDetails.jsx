import {
  CalendarDays,
  Heart,
  MapPin,
  PackageCheck,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import { fallbackProducts } from "../data/fallbackProducts";
import { useCart } from "../store/CartContext";
import { useWishlist } from "../store/WishlistContext";
import { dateText, money } from "../utils/format";

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data);
        setSelectedImage(data.image_url);
        setSize(data.sizes?.split(",")[0]?.trim() || "");
      })
      .catch(() => {
        const fallback =
          fallbackProducts.find((item) => item.slug === slug) ||
          fallbackProducts[0];
        setProduct({
          ...fallback,
          description:
            "Authentic Odisha traditional food prepared in fresh batches.",
          cultural_significance:
            "A beloved part of Odia family celebrations and festival meals.",
          ingredients: "Rice, jaggery, coconut, ghee, seasonal spices",
          preparation: "Prepared using traditional home-style methods.",
          region_origin: "Odisha",
          nutrition: "Balanced festive food. Enjoy in moderation.",
          storage: "Store as per label instructions.",
          sizes: "250g, 500g",
          reviews: [],
          related: fallbackProducts.slice(0, 4),
        });
        setSelectedImage(fallback.image_url);
      });
  }, [slug]);

  if (!product)
    return (
      <section className="container-page py-20">Loading product...</section>
    );

  const sizes = product.sizes?.split(",").map((item) => item.trim()) || [];
  const wished = isWishlisted(product.id);

  return (
    <section className="container-page py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-lg border border-temple/10 bg-white shadow-soft">
            <img
              src={selectedImage}
              alt={product.name}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {(product.images?.length
              ? product.images
              : [{ image_url: product.image_url }]
            ).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image.image_url)}
                className="overflow-hidden rounded-md border border-temple/10"
              >
                <img
                  src={image.image_url}
                  alt={image.alt_text || product.name}
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="rounded-full bg-haldi/20 px-4 py-2 text-xs font-bold uppercase tracking-wide text-temple">
            {product.category}
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold text-temple md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg leading-8 text-ink/72">
            {product.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-clay">
              <Star size={16} fill="currentColor" /> 4.8 rating
            </span>
            <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sindoor">
              <PackageCheck size={16} /> {product.availability}
            </span>
            <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-temple">
              <MapPin size={16} /> {product.region_origin}
            </span>
          </div>

          <div className="mt-8 rounded-lg border border-temple/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-ink/55">Price starts at</p>
                <p className="text-3xl font-bold text-ink">
                  {money(product.price)}
                  {product.price_unit && (
                    <span className="ml-1 text-base font-medium text-ink/50">/ {product.price_unit.replace("Per ", "")}</span>
                  )}
                </p>
              </div>
              <div className="text-right text-sm text-ink/65">
                <p>Manufactured: {dateText(product.manufacturing_date)}</p>
                <p>Expiry: {dateText(product.expiry_date)}</p>
                <p>{product.shelf_life_days} day shelf life</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <select
                className="input"
                value={size}
                onChange={(event) => setSize(event.target.value)}
              >
                {sizes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
              />
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={async () => {
                  const result = await addToCart(product, quantity, size);

                  if (result === "added") {
                    setToast({ emoji: "🛒", text: "Added to cart!" });
                    setTimeout(() => setToast(null), 3000);
                  }
                }}
                className="btn-primary"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button
                onClick={async () => {
                  await addToCart(product, quantity, size);
                  navigate("/checkout");
                }}
                className="btn-secondary"
              >
                Buy Now
              </button>
              <button
                onClick={async () => {
                  try {
                    const result = await toggleWishlist(product);

                    if (result === "added") {
                      setToast({ emoji: "❤️", text: "Added to wishlist!" });
                    }

                    if (result === "removed") {
                      setToast({ emoji: "💔", text: "Removed from wishlist!" });
                    }

                    setTimeout(() => setToast(null), 3000);
                  } catch {
                    navigate("/");
                  }
                }}
                className={`btn-secondary px-4 ${wished ? "bg-sindoor text-white hover:bg-sindoor hover:text-white" : ""}`}
                title={wished ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={18} fill={wished ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {[
          ["Cultural Significance", product.cultural_significance],
          ["Ingredients", product.ingredients],
          ["Preparation Process", product.preparation],
          ["Nutritional Information", product.nutrition],
          ["Storage Instructions", product.storage],
          ["Festival Collection", product.festival_tag],
        ].map(([title, text]) => (
          <article
            key={title}
            className="rounded-lg border border-temple/10 bg-white p-6 shadow-sm"
          >
            <h2 className="font-display text-2xl font-bold text-temple">
              {title}
            </h2>
            <p className="mt-3 leading-7 text-ink/70">{text}</p>
          </article>
        ))}
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-temple/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-temple">
            Customer Reviews
          </h2>
          <div className="mt-5 grid gap-4">
            {(product.reviews?.length
              ? product.reviews
              : [
                  {
                    user_name: "Demo Customer",
                    rating: 5,
                    comment: "Fresh and authentic taste.",
                  },
                ]
            ).map((review, index) => (
              <div key={index} className="rounded-md bg-rice p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{review.user_name}</p>
                  <p className="text-sm font-bold text-clay">
                    {review.rating}/5
                  </p>
                </div>
                <p className="mt-2 text-sm text-ink/70">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-temple/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-temple">
            Delivery Promise
          </h2>
          <div className="mt-5 grid gap-4 text-ink/70">
            <p className="flex gap-3">
              <CalendarDays className="text-sindoor" /> Fresh manufacturing date
              and expiry date shown before purchase.
            </p>
            <p className="flex gap-3">
              <PackageCheck className="text-sindoor" /> Airtight festival-safe
              packaging for delicate pithas and beverages.
            </p>
          </div>
        </section>
      </div>

      {!!product.related?.length && (
        <section className="mt-16">
          <div className="flex items-end justify-between">
            <h2 className="section-title">Related Products</h2>
            <Link to="/catalog" className="text-sm font-bold text-temple">
              View all
            </Link>
          </div>
          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {product.related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            background: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            zIndex: 9999,
          }}
        >
          {toast.emoji} {toast.text}
        </div>
      )}
    </section>
  );
}