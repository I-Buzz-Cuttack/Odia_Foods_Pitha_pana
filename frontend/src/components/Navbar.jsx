import { Bell, Heart, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useCart } from "../store/CartContext";

const navItems = [
  ["Home", "/home"],
  ["Catalog", "/catalog"],
  ["Knowledge", "/knowledge"],
  ["Orders", "/orders"],
];

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = () =>
      api
        .get("/admin/notifications")
        .then((r) => setNotifications(r.data))
        .catch(() => {});
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const markRead = async (n) => {
    await api.patch(`/admin/notifications/${n.id}/read`);
    setNotifications((prev) => prev.filter((x) => x.id !== n.id));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md border border-temple/10 p-3 text-temple"
        title="Notifications"
      >
        <Bell size={19} />
        {notifications.length > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-sindoor px-1.5 text-xs font-bold text-white min-w-[20px] text-center">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-80 rounded-xl border border-temple/10 bg-white shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-temple/10 flex justify-between items-center">
            <p className="text-sm font-bold text-temple">Notifications</p>
            <span className="text-xs text-ink/40">
              {notifications.length} unread
            </span>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-ink/40 text-center py-8">
              No new notifications
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-temple/5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 hover:bg-rice transition-colors"
                >
                  <div className="text-xs text-ink/70 leading-relaxed">
                    {n.message.split(" | ").map((part, i) => (
                      <div key={i}>{part}</div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-ink/30">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                    <button
                      onClick={() => markRead(n)}
                      className="text-xs font-semibold text-sindoor hover:text-temple transition-colors"
                    >
                      Mark read ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { items } = useCart();
  const count = items.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-temple/10 bg-rice/90 backdrop-blur-xl">
      <nav className="container-page flex h-20 items-center justify-between">
        <Link
          to="/home"
          className="flex items-center gap-3"
          aria-label="Odisha Pitha home"
        >
          <img
            src="https://res.cloudinary.com/dqac99h6g/image/upload/v1750780000/today_vedge_transparent_aeg9sd"
            alt="Today Vedge"
            className="h-24 w-24 rounded-full object-cover"
          />

          <span>
            <span className="block font-display text-xl font-bold text-temple">
              Odisha Pitha
            </span>
            <span className="block text-xs font-medium uppercase tracking-[0.2em] text-clay">
              Pana Marketplace
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                `text-sm font-semibold transition ${isActive ? "text-temple" : "text-ink/70 hover:text-temple"}`
              }
            >
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className="text-sm font-semibold text-temple">
              Admin
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/manage" className="text-sm font-semibold text-temple">
              Manage
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAdmin && <NotificationBell />}
          <Link
            to="/wishlist"
            className="rounded-md border border-temple/10 p-3 text-temple"
            title="Wishlist"
          >
            <Heart size={19} />
          </Link>
          <Link
            to="/cart"
            className="relative rounded-md border border-temple/10 p-3 text-temple"
            title="Cart"
          >
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 rounded-full bg-haldi px-2 text-xs font-bold text-ink">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <button onClick={logout} className="btn-secondary py-2">
              Logout
            </button>
          ) : (
            <Link to="/login" className="btn-primary py-2">
              <UserRound size={17} /> Login
            </Link>
          )}
        </div>

        <button
          className="rounded-md border border-temple/10 p-3 text-temple md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-temple/10 bg-rice md:hidden">
          <div className="container-page grid gap-3 py-5">
            {navItems.map(([label, href]) => (
              <NavLink
                key={href}
                to={href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 font-semibold text-temple"
              >
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-md px-3 py-2 font-semibold text-temple"
              >
                Admin
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/manage"
                className="rounded-md px-3 py-2 font-semibold text-temple"
              >
                Manage Store
              </Link>
            )}
            <Link
              to="/cart"
              className="rounded-md px-3 py-2 font-semibold text-temple"
            >
              Cart ({count})
            </Link>
            {user ? (
              <button onClick={logout} className="btn-secondary">
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}