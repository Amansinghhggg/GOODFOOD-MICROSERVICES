import React from "react";
import type { IRestaurant } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import { Edit, MapPin, Phone, LogOut } from "lucide-react";
import { useAppContext } from "../../context/context";
import toast from "react-hot-toast";
import AddItems from "./addItems";
import AllMenuItems from "./allMenuItems";
import ActiveOrders from "./OrdersTab";

type Props = {
  reload: boolean;
  restaurant: IRestaurant;
  onToggle?: (open: boolean) => Promise<void> | void;
};

const YourRestaurant: React.FC<Props> = ({ reload,restaurant, onToggle }) => {
  if (!restaurant) return null;
  const image = restaurant.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(
    restaurant.name || "Restaurant"
  )}&background=E23774&color=fff`;


  const formattedAddress = restaurant.autoLocation?.formattedAddress || "Address not available";
  const [isOpen, setIsOpen] = React.useState<boolean>(!!restaurant.isOpen);
  const [active, setActive] = React.useState<"menu" | "add" | "orders">("menu");
  function gotoMenu(){
    setActive("menu");
  }
  async function handleToggle() {
    const next = !isOpen;
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
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    navigate("/login", { replace: true });
    toast.success("Logged out successfully");
  }

  

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl overflow-hidden border border-orange-100 bg-white shadow-sm">
        {/* Upper header - larger */}
        <div className="bg-linear-to-r from-[#E23774] via-[#f65d95] to-[#ff8a5c] p-10 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-6">
              <div className="h-36 w-36 shrink-0 overflow-hidden rounded-3xl border border-white/30 bg-white/10 shadow-lg">
                <img
                  src={image}
                  alt={restaurant.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-3xl font-extrabold">
                  {restaurant.name}&nbsp;&nbsp;
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${isOpen ? "bg-emerald-500 " : "bg-gray-500 text-white"}`}
                  >
                    {isOpen ? "Open" : "Closed"}
                  </div>
                </h1>

                <p className="mt-2 max-w-xl text-sm text-white/90">
                  {restaurant.description || "No description provided."}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  <div className="inline-flex items-center gap-2">
                    <MapPin size={16} />
                    <span className="truncate max-w-xl">
                      {formattedAddress}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <Phone size={16} />
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] uppercase tracking-[0.22em] text-white/70">Phone</span>
                      <a
                        href={`tel:+91${String(restaurant.phone)}`}
                        className="inline-flex items-center font-bold text-white underline decoration-white/60 underline-offset-4 transition hover:text-orange-100"
                        aria-label={`Call ${restaurant.name} at ${restaurant.phone}`}
                      >
                        +91 {restaurant.phone}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    to="/edit-restaurant"
                    className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white"
                  >
                    <Edit size={16} /> Edit
                  </Link>
                  <button
                    onClick={handleToggle}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isOpen ? "bg-white text-[#E23774]" : "bg-emerald-500 text-white"}`}
                  >
                    {isOpen ? "Set Closed" : "Set Open"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#E23774]"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 lg:mt-0 lg:ml-auto text-sm text-white/90">
              <div>
                Created: {new Date(restaurant.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-2">
                OwnerId: {(restaurant as any).owner || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-orange-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActive("menu")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${active === "menu" ? "bg-[#E23774] text-white" : "bg-slate-50 text-slate-700"}`}
              >
                Menu
              </button>
              <button
                onClick={() => setActive("add")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${active === "add" ? "bg-[#E23774] text-white" : "bg-slate-50 text-slate-700"}`}
              >
                Add Item
              </button>
              <button
                onClick={() => setActive("orders")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${active === "orders" ? "bg-[#E23774] text-white" : "bg-slate-50 text-slate-700"}`}
              >
                Orders
              </button>
             
            </div>
            <div className="text-sm text-slate-500">Manage your restaurant</div>
          </div>

          <div className="mt-6">
            {active === "add" && <AddItems gotoMenu={gotoMenu} />}
            {active === "menu" && (
              <AllMenuItems
              isOpen={isOpen}
                restaurantId={restaurant._id}
                restaurantOwner={restaurant.owner}
              />
            )}
            {active === "orders" && <ActiveOrders reload={reload} restaurantId={restaurant._id}/>}

          </div>
        </div>
      </div>
    </div>
  );
};

export default YourRestaurant;
