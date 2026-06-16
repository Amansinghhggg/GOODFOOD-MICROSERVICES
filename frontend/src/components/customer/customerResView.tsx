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
      <div className="min-h-screen bg-[#f7f7f7]">
        {/* Skeleton Hero */}
        <div className="relative overflow-hidden bg-[#e8e8e8] h-52 sm:h-64 animate-pulse"></div>
        
        {/* Skeleton Profile */}
        <div className="relative -mt-10 px-4 sm:px-8 max-w-5xl mx-auto flex items-end gap-4 pb-6">
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-[#d4d4d4] animate-pulse border-4 border-white sm:h-24 sm:w-24"></div>
          <div className="flex-1 space-y-3 pb-2">
            <div className="h-8 w-1/3 bg-[#d4d4d4] animate-pulse rounded"></div>
            <div className="h-4 w-1/2 bg-[#d4d4d4] animate-pulse rounded"></div>
          </div>
        </div>

        {/* Skeleton Info Strip */}
        <div className="border-b border-[#e8e8e8] bg-white px-4 py-4 shadow-sm sm:px-8">
          <div className="mx-auto flex max-w-5xl gap-6">
            <div className="h-4 w-1/4 bg-[#e8e8e8] animate-pulse rounded"></div>
            <div className="h-4 w-1/6 bg-[#e8e8e8] animate-pulse rounded"></div>
            <div className="h-4 w-1/5 bg-[#e8e8e8] animate-pulse rounded"></div>
          </div>
        </div>

        {/* Skeleton Menu Items */}
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
          <div className="h-6 w-32 bg-[#e8e8e8] animate-pulse rounded mb-6"></div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl border border-[#e8e8e8] bg-white">
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-3/4 bg-[#f0f0f0] animate-pulse rounded"></div>
                  <div className="h-3 w-full bg-[#f0f0f0] animate-pulse rounded"></div>
                  <div className="h-3 w-5/6 bg-[#f0f0f0] animate-pulse rounded"></div>
                  <div className="h-4 w-16 bg-[#f0f0f0] animate-pulse rounded mt-2"></div>
                </div>
                <div className="h-24 w-24 rounded-xl bg-[#f0f0f0] animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="flex min-h-60 items-center justify-center text-sm font-medium text-[#999999]">
        Restaurant not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#111111]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Banner image */}
        <div className="h-52 w-full overflow-hidden sm:h-64 bg-[#111111]">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover blur-[2px] scale-103 opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-black/80" />
        </div>

        {/* Content over banner */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 pb-6 sm:px-8">
            <div className="flex items-end gap-4 max-w-5xl mx-auto">
              {/* Logo */}
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 shadow-xl sm:h-24 sm:w-24 bg-white">
                <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
              </div>

              <div className="flex-1 text-white pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-serif text-3xl font-black drop-shadow sm:text-4xl">{restaurant.name}</h1>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${restaurant.isOpen ? "bg-emerald-500 text-white border border-emerald-400" : "bg-[#555555] text-white border border-[#333333]"}`}>
                    {restaurant.isOpen ? "● OPEN" : "○ CLOSED"}
                  </span>
                </div>
                {restaurant.description && (
                  <p className="mt-2 max-w-lg text-sm text-white/90 drop-shadow-md leading-relaxed font-medium">{restaurant.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="border-b border-[#e8e8e8] bg-white px-4 py-4 shadow-sm sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 text-xs text-[#555555] font-semibold">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#ff385c]" />
            <span className="max-w-xs truncate">{restaurant.autoLocation?.formattedAddress || "Address not available"}</span>
          </div>
          <span className="text-[#e8e8e8]">|</span>
          <a href={`tel:+91${restaurant.phone}`} className="flex items-center gap-1.5 font-bold text-[#111111] hover:text-[#ff385c] transition-colors">
            <Phone size={14} className="text-[#ff385c]" />
            +91 {restaurant.phone}
          </a>
          <span className="text-[#e8e8e8]">|</span>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#ff385c]" />
            Since {new Date(restaurant.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <h2 className="mb-6 font-serif text-2xl font-black text-[#111111]">Menu</h2>
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
