import { useEffect, useState } from "react";
import { useAppContext } from "../context/context";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { restaurantService } from "../main";
import { MapPin, Clock } from "lucide-react";

export default function Home() {
  const { location } = useAppContext();
  const searchParams = useSearchParams()[0];
  const search = searchParams.get("search") || "";
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  async function fetchRestaurants() {
    if (!location?.latitude || !location?.longitude) return;
    setLoading(true);
    try {
      const response = await axios.get(`${restaurantService}/api/restaurant/all`, {
        params: { latitude: location?.latitude, longitude: location?.longitude, search },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRestaurants();
  }, [search, location]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8 sm:px-6 lg:px-8">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#E23774]/8 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30">Discover</p>
          <h1 className="mt-1 text-3xl font-black text-white">Nearby Restaurants</h1>
          {location && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.04] px-3 py-1.5">
              <MapPin size={12} className="text-[#E23774]" />
              <span className="text-xs text-white/50 truncate max-w-xs">
                {location.formattedAddress || "Detecting location..."}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
            <div className="text-4xl">🍽️</div>
            <p className="text-base font-semibold text-white">No restaurants nearby</p>
            <p className="text-sm text-white/40">Try a different location or check back later</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant: any) =>
              restaurant.isOpen ? (
                <Link
                  to={`/restaurant/${restaurant._id}`}
                  key={restaurant._id}
                  className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition hover:border-white/10 hover:bg-white/[0.05] hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    {restaurant.distanceKm && (
                      <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                        {restaurant.distanceKm} km
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-sm border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Open
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-base font-bold text-white">{restaurant.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-white/40">{restaurant.description}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-white/30">
                      <MapPin size={11} />
                      <span className="truncate">{restaurant.autoLocation?.formattedAddress || "Unknown address"}</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  key={restaurant._id}
                  className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] opacity-50"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white/70 backdrop-blur-sm border border-white/10">
                        <Clock size={14} />
                        Closed
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-base font-bold text-white/60">{restaurant.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-white/25">{restaurant.description}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-white/20">
                      <MapPin size={11} />
                      <span className="truncate">{restaurant.autoLocation?.formattedAddress || "Unknown address"}</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
