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
    <div className="min-h-screen bg-[#f7f7f7] px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="font-serif text-xs font-semibold uppercase tracking-[0.2em] text-[#ff385c]">Discover</p>
          <h1 className="mt-1 font-serif text-3xl font-black text-[#111111] sm:text-4xl">Nearby Restaurants</h1>
          {location && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-3.5 py-2 shadow-sm">
              <MapPin size={14} className="text-[#ff385c]" />
              <span className="text-xs font-bold text-[#555555] truncate max-w-xs">
                {location.formattedAddress || "Detecting location..."}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
                <div className="h-48 w-full animate-pulse bg-[#f0f0f0]" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-[#f0f0f0]" />
                  <div className="h-3 w-full animate-pulse rounded bg-[#f0f0f0]" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-[#f0f0f0]" />
                  <div className="mt-4 flex items-center gap-2 pt-2">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-[#f0f0f0]" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-[#f0f0f0]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-[#cccccc] bg-white py-24 text-center shadow-sm">
            <div className="text-5xl">🍽️</div>
            <p className="font-serif text-xl font-bold text-[#111111]">No restaurants nearby</p>
            <p className="text-sm font-medium text-[#999999]">Try a different location or check back later</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant: any) =>
              restaurant.isOpen ? (
                <Link
                  to={`/restaurant/${restaurant._id}`}
                  key={restaurant._id}
                  className="group overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white transition-all duration-300 hover:border-[#ff385c]/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#ff385c]/5"
                >
                  <div className="relative h-48 overflow-hidden bg-[#f0f0f0]">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-90" />
                    {restaurant.distanceKm && (
                      <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black text-[#111111] backdrop-blur-md shadow-sm">
                        {restaurant.distanceKm} km
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-black text-white shadow-sm border border-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        OPEN
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="font-serif text-lg font-bold text-[#111111] group-hover:text-[#ff385c] transition-colors">{restaurant.name}</h2>
                    <p className="mt-1.5 line-clamp-2 text-xs text-[#555555] leading-relaxed font-medium">{restaurant.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#999999] border-t border-[#f0f0f0] pt-4">
                      <MapPin size={13} className="text-[#ff385c]" />
                      <span className="truncate">{restaurant.autoLocation?.formattedAddress || "Unknown address"}</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  key={restaurant._id}
                  className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white opacity-60"
                >
                  <div className="relative h-48 overflow-hidden bg-[#f0f0f0]">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-[#111111]/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-black text-white border border-white/30 backdrop-blur-md">
                        <Clock size={14} />
                        CLOSED
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="font-serif text-lg font-bold text-[#555555]">{restaurant.name}</h2>
                    <p className="mt-1.5 line-clamp-2 text-xs text-[#999999] font-medium leading-relaxed">{restaurant.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#999999] border-t border-[#f0f0f0] pt-4">
                      <MapPin size={13} />
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
