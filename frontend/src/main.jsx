import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./store/AuthContext.jsx";
import { CartProvider } from "./store/CartContext.jsx";
import { WishlistProvider } from "./store/WishlistContext.jsx";
import { CouponProvider } from "./store/CouponContext.jsx";
import "./styles.css";

const razorpayScript = document.createElement("script");
razorpayScript.src = "https://checkout.razorpay.com/v1/checkout.js";
document.head.appendChild(razorpayScript);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CouponProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </CouponProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
