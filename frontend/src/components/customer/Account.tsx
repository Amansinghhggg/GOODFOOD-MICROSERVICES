import { useAppContext } from "../../context/context";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {  Home, Mail, Package, ShieldCheck, LogOut, MapPin, User, ChevronRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { restaurantService } from "../../main";
import axios from "axios";

type Address = {
  _id: string;
  mobile: number;
  formattedAddress: string;
};

const STATUS_COLORS: Record<string, string> = {
  placed:          "bg-amber-100 text-amber-700",
  accepted:        "bg-blue-100 text-blue-700",
  preparing:       "bg-indigo-100 text-indigo-700",
  ready_for_rider: "bg-emerald-100 text-emerald-700",
  rider_assigned:  "bg-cyan-100 text-cyan-700",
  picked_up:       "bg-violet-100 text-violet-700",
  delivered:       "bg-green-100 text-green-700",
  cancelled:       "bg-red-100 text-red-700",
};

const Account = () => {
  const { setIsAuth, setUser, user, location, city } = useAppContext();
  const navigate = useNavigate();
  const [address, setAddress] = useState<Address[]>([]);
  const [orders, setOrders] = useState([] as any[]);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    navigate("/login", { replace: true });
    toast.success("Logged out successfully");
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4 py-10">
        <div className="rounded-3xl border border-orange-100 bg-white px-10 py-12 text-center shadow-xl shadow-rose-100/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E23774]/10 text-[#E23774]">
            <User size={28} />
          </div>
          <h1 className="text-xl font-black text-slate-900">No account found</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in again to view your profile.</p>
        </div>
      </div>
    );
  }

  const avatar = user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=E23774&color=fff`;
  const primaryAddress = location?.formattedAddress || city;

  async function fetchAddress() {
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAddress(Array.isArray(data?.addresses) ? data.addresses : []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }

  async function fetchOrders() {
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/customer/my`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  useEffect(() => {
    fetchAddress();
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* ── Hero banner ── */}
        <div className="relative overflow-hidden rounded-3xl shadow-premium-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary to-brand-charcoal" />
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-black/5 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 overflow-hidden rounded-2xl border-2 border-white/20 shadow-premium">
                <img src={avatar} alt={user.name} className="h-full w-full object-cover" />
              </div>
              <div className="text-white">
                <p className="font-serif text-[10px] uppercase tracking-widest text-brand-gold">My Account</p>
                <h1 className="mt-1 font-serif text-2xl font-black">{user.name}</h1>
                <p className="text-xs text-white/70">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">

          {/* Left col */}
          <div className="space-y-6">
            {/* Profile details */}
            <div className="rounded-3xl bg-brand-card p-5 shadow-premium border border-brand-border/60">
              <h2 className="mb-4 font-serif text-xs font-bold uppercase tracking-widest text-brand-muted">Profile</h2>
              <div className="space-y-3">
                {[
                  { icon: <Mail size={14} />, label: "Email", value: user.email },
                  { icon: <ShieldCheck size={14} />, label: "Role", value: user.role || "Not selected" },
                  { icon: <MapPin size={14} />, label: "Area", value: primaryAddress || "Unknown" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl bg-brand-cream border border-brand-border/40 px-4 py-3">
                    <span className="text-brand-primary">{icon}</span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-muted">{label}</p>
                      <p className="text-xs font-semibold text-brand-charcoal break-all">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Account summary dark card */}
            <div className="relative overflow-hidden rounded-3xl bg-brand-charcoal p-5 text-white shadow-premium">
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/5" />
              <h2 className="mb-4 font-serif text-xs uppercase tracking-widest text-white/40">Account Summary</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">User ID</p>
                  <p className="mt-0.5 break-all font-mono text-[10px] text-white/60">{user._id}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Session</p>
                    <span className="mt-1 inline-flex rounded-full bg-brand-success/20 px-3 py-1 text-[10px] font-bold text-brand-success">
                      ● Active
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Orders</p>
                    <p className="mt-1 text-2xl font-black text-brand-gold font-serif">{orders.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-6">
            {/* Orders */}
            <div className="rounded-3xl bg-brand-card p-5 shadow-premium border border-brand-border/60">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                    <Package size={15} />
                  </div>
                  <h2 className="font-serif text-sm font-bold text-brand-charcoal">Your Orders</h2>
                </div>
                {orders.length > 0 && (
                  <span className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-xs font-bold text-brand-primary">{orders.length}</span>
                )}
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border/60 py-8 text-center bg-brand-cream/35">
                    <Package size={28} className="mb-2 text-brand-muted/40" />
                    <p className="text-sm font-bold text-brand-charcoal">No orders yet</p>
                    <p className="text-xs text-brand-muted">Your order history will appear here</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <Link
                      to={`/order/${order._id}`}
                      key={order._id}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-brand-border/60 bg-brand-cream/30 px-4 py-3 transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-serif text-sm font-bold text-brand-charcoal truncate">{order.restaurantName}</p>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${STATUS_COLORS[order.status] ?? "bg-brand-cream-dark text-brand-muted"}`}>
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-brand-muted">
                          {order.items.slice(0, 2).map((i: any) => i.name).join(", ")}
                          {order.items.length > 2 && ` +${order.items.length - 2} more`}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-brand-muted/70">
                          <Clock size={10} />
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-brand-charcoal">₹{order.totalAmount}</p>
                        <ChevronRight size={14} className="ml-auto mt-1 text-brand-muted transition group-hover:text-brand-primary" />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Addresses */}
            <div className="rounded-3xl bg-brand-card p-5 shadow-premium border border-brand-border/60">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-secondary/10 text-brand-secondary">
                    <Home size={15} />
                  </div>
                  <h2 className="font-serif text-sm font-bold text-brand-charcoal">Addresses</h2>
                </div>
                <Link
                  to="/AddAddress"
                  className="inline-flex items-center gap-1 rounded-xl bg-brand-primary px-3 py-1.5 text-xs font-bold text-white shadow-premium-sm transition hover:bg-brand-primary-hover"
                >
                  + Add
                </Link>
              </div>

              {address.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border/60 py-8 text-center bg-brand-cream/35">
                  <MapPin size={28} className="mb-2 text-brand-muted/40" />
                  <p className="text-sm font-bold text-brand-charcoal">No saved addresses</p>
                </div>
              ) : (
                <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                  {address.map((addr) => (
                    <div key={addr._id} className="flex items-start gap-3 rounded-2xl border border-brand-border/40 bg-brand-cream/30 px-4 py-3">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-brand-primary" />
                      <div>
                        <p className="text-xs font-semibold text-brand-charcoal leading-relaxed">{addr.formattedAddress}</p>
                        <p className="mt-0.5 text-[10px] text-brand-muted font-medium">📞 {addr.mobile}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
