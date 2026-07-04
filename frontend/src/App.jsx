import { Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManage from "./pages/AdminManage";
import Cart from "./pages/Cart";
import Catalog from "./pages/Catalog";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import KnowledgeHub from "./pages/KnowledgeHub";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import { useAuth } from "./store/AuthContext";

const Protected = ({ children, admin = false }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (admin && !isAdmin) return <Navigate to="/home" replace />;
  return children;
};

const PublicEntry = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/home" replace />;
  return <Login />;
};

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden">
      {user && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<PublicEntry />} />
          <Route path="/login" element={<PublicEntry />} />
          <Route path="/home" element={<Protected><Home /></Protected>} />
          <Route path="/catalog" element={<Protected><Catalog /></Protected>} />
          <Route path="/products/:slug" element={<Protected><ProductDetails /></Protected>} />
          <Route path="/knowledge" element={<Protected><KnowledgeHub /></Protected>} />
          <Route path="/cart" element={<Protected><Cart /></Protected>} />
          <Route path="/wishlist" element={<Protected><Wishlist /></Protected>} />
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
          <Route path="/orders" element={<Protected><Orders /></Protected>} />
          <Route path="/admin" element={<Protected admin><AdminDashboard /></Protected>} />
          <Route path="/admin/manage" element={<Protected admin><AdminManage /></Protected>} />
          <Route path="*" element={<Navigate to={user ? "/home" : "/"} replace />} />
        </Routes>
      </main>
      {user && <Footer />}
    </div>
  );
}