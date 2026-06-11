import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { restaurantService } from "../../main";
import { MapPin, Phone, Clock } from "lucide-react";
import AllMenuItems from "../restaurant/allMenuItems";

interface Restaurant {
  _id: string;
  name: string;
  description?: string;
  image: string;
  owner: string;
  phone: number;
  isVerified: boolean;
  autoLocation: {
    type: "Point";
    coordinates: [number, number];
    formattedAddress: String;
  };
  isOpen: boolean;
  createdAt: Date;
}

const CustomerResView = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  async function fetchRestaurantDetails() {
    setLoading(true);
    try {
      const data = await axios.get(`${restaurantService}/api/restaurant/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRestaurant(data.data.restaurant);
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRestaurantDetails(); }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-rose-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading restaurant…
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-60 items-center justify-center text-sm text-slate-400">
        Restaurant not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Banner image */}
        <div className="h-52 w-full overflow-hidden sm:h-64">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover blur-sm scale-105 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
        </div>

        {/* Content over banner */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 pb-6 sm:px-8">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/40 shadow-xl sm:h-24 sm:w-24">
                <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
              </div>

              <div className="flex-1 text-white pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black drop-shadow sm:text-3xl">{restaurant.name}</h1>
                  <span className={`rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-widest ${restaurant.isOpen ? "bg-emerald-400/90 text-white" : "bg-gray-500/80 text-white"}`}>
                    {restaurant.isOpen ? "● Open" : "○ Closed"}
                  </span>
                </div>
                {restaurant.description && (
                  <p className="mt-1 max-w-lg text-sm text-white/80 drop-shadow">{restaurant.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="border-b border-rose-100 bg-white px-4 py-3 shadow-sm sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-[#E23774]" />
            <span className="max-w-xs truncate">{restaurant.autoLocation?.formattedAddress || "Address not available"}</span>
          </div>
          <span className="text-slate-300">|</span>
          <a href={`tel:+91${restaurant.phone}`} className="flex items-center gap-1.5 font-semibold text-slate-700 hover:text-[#E23774]">
            <Phone size={13} className="text-[#E23774]" />
            +91 {restaurant.phone}
          </a>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-[#E23774]" />
            Since {new Date(restaurant.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
        <h2 className="mb-4 text-lg font-black text-slate-800">Menu</h2>
        <AllMenuItems
          restaurantId={restaurant._id}
          restaurantOwner={restaurant.owner}
          isOpen={restaurant.isOpen}
        />
      </div>
    </div>
  );
};

export default CustomerResView;
