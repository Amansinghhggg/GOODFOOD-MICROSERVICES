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
    <div className="min-h-screen bg-brand-cream text-brand-charcoal">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Banner image */}
        <div className="h-52 w-full overflow-hidden sm:h-64 bg-brand-charcoal">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover blur-[2px] scale-103 opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/20 via-brand-charcoal/45 to-brand-charcoal/80" />
        </div>

        {/* Content over banner */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 pb-6 sm:px-8">
            <div className="flex items-end gap-4">
              {/* Logo */}
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 shadow-premium sm:h-24 sm:w-24">
                <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover bg-brand-cream-dark" />
              </div>

              <div className="flex-1 text-white pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-2xl font-black drop-shadow sm:text-3xl">{restaurant.name}</h1>
                  <span className={`rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest ${restaurant.isOpen ? "bg-brand-success text-white" : "bg-brand-muted text-white"}`}>
                    {restaurant.isOpen ? "● Open" : "○ Closed"}
                  </span>
                </div>
                {restaurant.description && (
                  <p className="mt-1 max-w-lg text-xs text-white/95 drop-shadow leading-relaxed">{restaurant.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="border-b border-brand-border bg-brand-card px-4 py-3 shadow-premium-sm sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 text-xs text-brand-muted font-medium">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-brand-primary" />
            <span className="max-w-xs truncate">{restaurant.autoLocation?.formattedAddress || "Address not available"}</span>
          </div>
          <span className="text-brand-border/60">|</span>
          <a href={`tel:+91${restaurant.phone}`} className="flex items-center gap-1.5 font-bold text-brand-charcoal hover:text-brand-primary transition-colors">
            <Phone size={13} className="text-brand-primary" />
            +91 {restaurant.phone}
          </a>
          <span className="text-brand-border/60">|</span>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-brand-primary" />
            Since {new Date(restaurant.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-8">
        <h2 className="mb-4 font-serif text-lg font-bold text-brand-charcoal">Menu</h2>
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
