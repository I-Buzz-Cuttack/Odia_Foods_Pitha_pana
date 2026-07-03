import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CouponContext = createContext(null);

export const CouponProvider = ({ children }) => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]); // publicly visible coupons

  const refreshPublic = async () => {
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data);
    } catch {
      setCoupons([]);
    }
  };

  useEffect(() => {
    if (user) refreshPublic();
  }, [user]);

  const fetchAdminCoupons = async () => {
    const { data } = await api.get("/admin/coupons");
    return data.map((c) => ({
      id: c.id,
      code: c.code || "",
      description: c.description || "",
      visible: !!c.is_visible,
      discountType: c.discount_type || "percent",
      discountValue: Number(c.discount_value) || 0,
    }));
  };

  const createCoupon = async ({ code, description, visible, discountType, discountValue }) => {
    await api.post("/admin/coupons", { code, description, visible, discountType, discountValue });
    await refreshPublic();
  };

  const updateCoupon = async (id, { code, description, visible, discountType, discountValue }) => {
    await api.put(`/admin/coupons/${id}`, { code, description, visible, discountType, discountValue });
    await refreshPublic();
  };

  const deleteCoupon = async (id) => {
    await api.delete(`/admin/coupons/${id}`);
    await refreshPublic();
  };

  const toggleVisibility = async (id) => {
    await api.patch(`/admin/coupons/${id}/visibility`);
    await refreshPublic();
  };

  const applyCoupon = async (code, amount) => {
    const { data } = await api.post("/coupon/apply", { code, amount });
    return data;
  };

  const value = {
    coupons,
    fetchAdminCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleVisibility,
    applyCoupon,
  };
  return <CouponContext.Provider value={value}>{children}</CouponContext.Provider>;
};

export const useCoupon = () => useContext(CouponContext);