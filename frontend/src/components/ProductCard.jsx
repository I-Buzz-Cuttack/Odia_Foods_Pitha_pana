// import { Heart, ShoppingBag, Star } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import { useCart } from "../store/CartContext";
// import { useWishlist } from "../store/WishlistContext";
// import { money } from "../utils/format";
// import { useState } from "react";

// export default function ProductCard({ product }) {
//   const [toast, setToast] = useState(null);
//   const { addToCart } = useCart();
//   const { isWishlisted, toggleWishlist } = useWishlist();
//   const navigate = useNavigate();
//   const wished = isWishlisted(product.id);

//   const handleWishlist = async () => {
//     try {
//       const result = await toggleWishlist(product);
//       if (result === "added") {
//         setToast({ emoji: "❤️", text: "Added to wishlist!" });
//         setTimeout(() => setToast(null), 3000);
//       }
//       if (result === "removed") {
//         setToast({ emoji: "💔", text: "Removed from wishlist!" });
//         setTimeout(() => setToast(null), 3000);
//       }
//     } catch {
//       navigate("/");
//     }
//   };

//   return (
//     <article className="group overflow-hidden rounded-lg border border-temple/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft">
//       <Link to={`/products/${product.slug}`} className="block">
//         <div className="aspect-[4/3] overflow-hidden bg-haldi/20">
//           <img
//             src={product.image_url}
//             alt={product.name}
//             className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
//             loading="lazy"
//           />
//         </div>
//       </Link>
//       <div className="p-4">
//         <div className="flex items-center justify-between gap-3">
//           <span className="rounded-full bg-haldi/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-temple">
//             {product.category}
//           </span>
//           <span className="flex items-center gap-1 text-sm font-semibold text-clay">
//             <Star size={15} fill="currentColor" /> 4.8
//           </span>
//         </div>
//         <Link to={`/products/${product.slug}`}>
//           <h3 className="mt-3 font-display text-xl font-bold text-temple">
//             {product.name}
//           </h3>
//         </Link>
//         <p className="mt-2 line-clamp-2 min-h-[3rem] text-sm leading-6 text-ink/70">
//           {product.short_description}
//         </p>
//         <div className="mt-4 flex items-center justify-between">
//           <div>
//             {/* <p className="font-bold text-ink">{money(product.price)}</p> */}
//             <p className="font-bold text-ink">
//               {money(product.price)}
//               {product.price_unit && (
//                 <span className="ml-1 text-xs font-medium text-ink/50">/ {product.price_unit.replace("Per ", "")}</span>
//               )}
//             </p>
//             <p className="text-xs text-palm">{product.availability}</p>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={handleWishlist}
//               className={`rounded-md border border-temple/10 p-3 transition hover:bg-rice ${wished ? "bg-sindoor text-white" : "text-temple"}`}
//               title={wished ? "Remove from wishlist" : "Add to wishlist"}
//             >
//               <Heart size={18} fill={wished ? "currentColor" : "none"} />
//             </button>
//             <button
//               onClick={async () => {
//                 const result = await addToCart(product);
//                 if (result === "added") {
//                   setToast({ emoji: "🛒", text: "Added to cart!" });
//                   setTimeout(() => setToast(null), 3000);
//                 }
//               }}
//               className="rounded-md bg-temple p-3 text-white transition hover:bg-sindoor"
//               title="Add to cart"
//             >
//               <ShoppingBag size={18} />
//             </button>
//           </div>
//         </div>
//       </div>
//       {toast && (
//         <div
//           style={{
//             position: "fixed",
//             bottom: 28,
//             right: 28,
//             zIndex: 9999,
//             background: "#fff",
//             border: "1px solid #e5e7eb",
//             borderRadius: 14,
//             padding: "12px 20px",
//             boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
//             display: "flex",
//             alignItems: "center",
//             gap: 10,
//             fontSize: 14,
//             fontWeight: 500,
//           }}
//         >
//           <span style={{ fontSize: 22 }}>{toast.emoji}</span>
//           <span>{toast.text}</span>
//         </div>
//       )}
//     </article>
//   );
// }




import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/CartContext";
import { useWishlist } from "../store/WishlistContext";
import { money } from "../utils/format";
import { useState } from "react";

export default function ProductCard({ product }) {
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const wished = isWishlisted(product.id);

  const handleWishlist = async () => {
    try {
      const result = await toggleWishlist(product);
      if (result === "added") {
        setToast({ emoji: "❤️", text: "Added to wishlist!" });
        setTimeout(() => setToast(null), 3000);
      }
      if (result === "removed") {
        setToast({ emoji: "💔", text: "Removed from wishlist!" });
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      navigate("/");
    }
  };

  return (
    <article className="group overflow-hidden rounded-lg border border-temple/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-haldi/20">
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-haldi/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-temple">
            {product.category}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-clay">
            <Star size={15} fill="currentColor" /> 4.8
          </span>
        </div>
        <Link to={`/products/${product.slug}`}>
          <h3 className="mt-3 font-display text-xl font-bold text-temple">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 min-h-[3rem] text-sm leading-6 text-ink/70">
          {product.short_description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            {/* <p className="font-bold text-ink">{money(product.price)}</p> */}
            <p className="font-bold text-ink">
              {money(product.price)}
              {product.price_unit && (
                <span className="ml-1 text-xs font-medium text-ink/50">/ {product.price_unit.replace("Per ", "")}</span>
              )}
            </p>
            <p className="text-xs text-sindoor">{product.availability}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleWishlist}
              className={`rounded-md border border-temple/10 p-3 transition hover:bg-rice ${wished ? "bg-sindoor text-white" : "text-temple"}`}
              title={wished ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={18} fill={wished ? "currentColor" : "none"} />
            </button>
            <button
              onClick={async () => {
                const result = await addToCart(product);
                if (result === "added") {
                  setToast({ emoji: "🛒", text: "Added to cart!" });
                  setTimeout(() => setToast(null), 3000);
                }
              }}
              className="rounded-md bg-temple p-3 text-white transition hover:bg-sindoor"
              title="Add to cart"
            >
              <ShoppingBag size={18} />
            </button>
          </div>
        </div>
      </div>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 14,
            padding: "12px 20px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <span style={{ fontSize: 22 }}>{toast.emoji}</span>
          <span>{toast.text}</span>
        </div>
      )}
    </article>
  );
}