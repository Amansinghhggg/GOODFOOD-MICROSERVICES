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
      <div className="min-h-screen bg-[#22201B]">
        {/* Skeleton Hero */}
        <div className="relative overflow-hidden bg-[#3A352F] h-52 sm:h-64 animate-pulse"></div>

        {/* Skeleton Profile */}
        <div className="relative -mt-10 px-4 sm:px-8 max-w-5xl mx-auto flex items-end gap-4 pb-6">
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-[#d4d4d4] animate-pulse border-4 border-white sm:h-24 sm:w-24"></div>
          <div className="flex-1 space-y-3 pb-2">
            <div className="h-8 w-1/3 bg-[#d4d4d4] animate-pulse rounded"></div>
            <div className="h-4 w-1/2 bg-[#d4d4d4] animate-pulse rounded"></div>
          </div>
        </div>

        {/* Skeleton Info Strip */}
        <div className="border-b border-[#3A352F] bg-[#2C2923] px-4 py-4 shadow-sm sm:px-8">
          <div className="mx-auto flex max-w-5xl gap-6">
            <div className="h-4 w-1/4 bg-[#3A352F] animate-pulse rounded"></div>
            <div className="h-4 w-1/6 bg-[#3A352F] animate-pulse rounded"></div>
            <div className="h-4 w-1/5 bg-[#3A352F] animate-pulse rounded"></div>
          </div>
        </div>

        {/* Skeleton Menu Items */}
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
          <div className="h-6 w-32 bg-[#3A352F] animate-pulse rounded mb-6"></div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl border border-[#3A352F] bg-[#2C2923]">
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
      <div className="flex min-h-60 items-center justify-center text-sm font-medium text-[#877E71]">
        Restaurant not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Banner image */}
        <div className="h-[35vh] min-h-[280px] w-full overflow-hidden bg-surface-container-highest">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover blur-[1px] scale-105 opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#22201B] via-[#22201B]/60 to-[#22201B]/10" />
        </div>

        {/* Content over banner */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-margin-mobile pb-6 md:px-gutter">
            <div className="flex flex-col md:flex-row md:items-end gap-5 max-w-container-max mx-auto">
              {/* Logo */}
              <div className="h-24 w-24 md:h-32 md:w-32 shrink-0 overflow-hidden rounded-[24px] border-4 border-[#22201B] shadow-md bg-[#22201B]">
                <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#EFEBE3] drop-shadow-sm">{restaurant.name}</h1>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm ${restaurant.isOpen ? "bg-brand-success/10 text-brand-success border border-brand-success/20" : "bg-[#2C2923] text-[#A39B8F] border border-[#3A352F]"}`}>
                    {restaurant.isOpen ? "● OPEN" : "○ CLOSED"}
                  </span>
                </div>
                {restaurant.description && (
                  <p className="max-w-xl text-sm text-[#A39B8F] font-medium drop-shadow-sm">{restaurant.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info strip */}
      <div className="border-b border-[#3A352F] bg-[#2C2923] px-4 py-4 shadow-sm sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 text-xs text-[#A39B8F] font-semibold">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-[#ff385c]" />
            <span className="max-w-xs truncate">{restaurant.autoLocation?.formattedAddress || "Address not available"}</span>
          </div>
          <span className="text-[#e8e8e8]">|</span>
          <a href={`tel:+91${restaurant.phone}`} className="flex items-center gap-1.5 font-bold text-[#EFEBE3] hover:text-[#ff385c] transition-colors">
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
        <h2 className="mb-6 font-serif text-2xl font-black text-[#EFEBE3]">Menu</h2>
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
