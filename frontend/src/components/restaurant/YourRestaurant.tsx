import React from "react";
import type { IRestaurant } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import { Edit, MapPin, Phone, LogOut, ChefHat, ShoppingBag, BarChart2, UtensilsCrossed } from "lucide-react";
import { useAppContext } from "../../context/context";
import toast from "react-hot-toast";
import AddItems from "./addItems";
import AllMenuItems from "./allMenuItems";
import ActiveOrders from "./OrdersTab";
import Sales from "./Sales";

type Props = {
  reload: boolean;
  restaurant: IRestaurant;
  onToggle?: (open: boolean) => Promise<void> | void;
};

const YourRestaurant: React.FC<Props> = ({ reload, restaurant, onToggle }) => {
  if (!restaurant) return null;
  const image =
    restaurant.image ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      restaurant.name || "Restaurant"
    )}&background=E23774&color=fff`;

  const formattedAddress =
    restaurant.autoLocation?.formattedAddress || "Address not available";
  const [isOpen, setIsOpen] = React.useState<boolean>(!!restaurant.isOpen);
  const [active, setActive] = React.useState<"menu" | "add" | "orders" | "sales">("menu");

  function gotoMenu() {
    setActive("menu");
  }

  async function handleToggle(next: boolean = !isOpen) {
    setIsOpen(next);
    try {
      if (onToggle) await onToggle(next);
      else toast.success(next ? "Restaurant set to open" : "Restaurant set to closed");
    } catch (err) {
      setIsOpen(!next);
      toast.error("Failed to update status");
    }
  }

  const { setIsAuth, setUser } = useAppContext();
  const navigate = useNavigate();

  function handleLogout() {
    handleToggle(false);
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    navigate("/login", { replace: true });
    toast.success("Logged out successfully");
  }

  const tabs = [
    { key: "menu",   label: "Menu",      icon: <UtensilsCrossed size={15} /> },
    { key: "add",    label: "Add Item",  icon: <ChefHat size={15} /> },
    { key: "orders", label: "Orders",    icon: <ShoppingBag size={15} /> },
    { key: "sales",  label: "Sales",     icon: <BarChart2 size={15} /> },
  ] as const;

  return (
    <div className="min-h-screen bg-[#22201B] px-3 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        {/* ── Hero Card ── */}
        <div className="relative overflow-hidden rounded-[32px] shadow-lg bg-[#2C2923] border border-[#3A352F]/60">
          {/* Background image spread */}
          <div className="absolute inset-0 z-0">
            <img src={image} className="w-full h-full object-cover blur-[2px] opacity-60 scale-105" alt="restaurant background" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C2923] via-[#2C2923]/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* Avatar */}
              <div className="relative shrink-0 self-start">
                <div className="h-28 w-28 overflow-hidden rounded-2xl border-4 border-white/20 shadow-premium sm:h-36 sm:w-36">
                  <img src={image} alt={restaurant.name} className="h-full w-full object-cover bg-[#22201B]-dark" />
                </div>
                {/* Online dot */}
                <span
                  className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white shadow ${
                    isOpen ? "bg-brand-success" : "bg-brand-muted"
                  }`}
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-white">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-serif text-2xl font-black tracking-tight sm:text-3xl">
                    {restaurant.name}
                  </h1>
                  <span
                    className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      isOpen
                        ? "bg-brand-success/20 text-white ring-1 ring-brand-success/40"
                        : "bg-[#2C2923]/10 text-white/60 ring-1 ring-white/20"
                    }`}
                  >
                    {isOpen ? "● Open" : "○ Closed"}
                  </span>
                </div>

                <p className="mt-2 max-w-lg text-xs leading-relaxed text-white/80">
                  {restaurant.description || "No description provided."}
                </p>

                {/* Contact row */}
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1.5 rounded-xl bg-[#2C2923]/10 px-3 py-1.5 backdrop-blur-sm">
                    <MapPin size={13} className="text-white/70" />
                    <span className="max-w-xs truncate text-white/95">{formattedAddress}</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl bg-[#2C2923]/10 px-3 py-1.5 backdrop-blur-sm">
                    <Phone size={13} className="text-white/70" />
                    <a
                      href={`tel:+91${String(restaurant.phone)}`}
                      className="font-semibold text-white hover:text-brand-gold"
                    >
                      +91 {restaurant.phone}
                    </a>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to="/edit-restaurant"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#2C2923]/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-[#2C2923]/20"
                  >
                    <Edit size={13} /> Edit Profile
                  </Link>
                  <button
                    onClick={() => handleToggle()}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition duration-200 ${
                      isOpen
                        ? "bg-[#2C2923]/90 text-brand-primary hover:bg-[#2C2923]"
                        : "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-premium-sm"
                    }`}
                  >
                    {isOpen ? "Set Closed" : "Set Open"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-black/20 px-4 py-2 text-xs font-bold text-white/90 backdrop-blur-sm transition hover:bg-black/30"
                  >
                    <LogOut size={13} /> Logout
                  </button>
                </div>
              </div>

              {/* Meta — top-right corner */}
              <div className="shrink-0 text-right text-[10px] text-white/50 sm:ml-auto">
                <p>Since {new Date(restaurant.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</p>
                <p className="mt-1 font-mono text-[9px]">ID: {(restaurant as any).owner}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs + Content Card ── */}
        <div className="mt-6 overflow-hidden rounded-3xl bg-[#2C2923] shadow-premium border border-[#3A352F]/60">
          {/* Tab bar */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-[#3A352F] bg-[#22201B]-dark/30 px-4 py-3 sm:px-6">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  active === key
                    ? "bg-brand-primary text-white shadow-premium-sm hover:bg-brand-primary-hover"
                    : "text-[#A39B8F] hover:bg-[#2C2923] hover:text-[#EFEBE3]"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
            <span className="ml-auto hidden text-xs text-[#A39B8F] sm:block">
              Manage your restaurant
            </span>
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-6">
            {active === "add"    && <AddItems gotoMenu={gotoMenu} />}
            {active === "menu"   && (
              <AllMenuItems
                isOpen={isOpen}
                restaurantId={restaurant._id}
                restaurantOwner={restaurant.owner}
              />
            )}
            {active === "orders" && <ActiveOrders reload={reload} restaurantId={restaurant._id} />}
            {active === "sales"  && <Sales />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YourRestaurant;
