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
    <div className="min-h-screen bg-brand-cream px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="font-serif text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">Discover</p>
          <h1 className="mt-1 font-serif text-3xl font-black text-brand-charcoal sm:text-4xl">Nearby Restaurants</h1>
          {location && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-cream-dark/50 px-3 py-1.5 shadow-premium-sm">
              <MapPin size={12} className="text-brand-primary" />
              <span className="text-xs font-semibold text-brand-muted truncate max-w-xs">
                {location.formattedAddress || "Detecting location..."}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-brand-cream-dark/50 border border-brand-border/40" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-brand-border bg-brand-card/45 py-20 text-center">
            <div className="text-4xl">🍽️</div>
            <p className="font-serif text-lg font-bold text-brand-charcoal">No restaurants nearby</p>
            <p className="text-sm text-brand-muted">Try a different location or check back later</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant: any) =>
              restaurant.isOpen ? (
                <Link
                  to={`/restaurant/${restaurant._id}`}
                  key={restaurant._id}
                  className="group overflow-hidden rounded-2xl border border-brand-border/60 bg-brand-card transition-all duration-300 hover:border-brand-primary/20 hover:-translate-y-1 hover:shadow-premium"
                >
                  <div className="relative h-48 overflow-hidden bg-brand-cream-dark">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-103"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
                    {restaurant.distanceKm && (
                      <div className="absolute right-3 top-3 rounded-full bg-brand-charcoal/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm shadow-premium-sm">
                        {restaurant.distanceKm} km
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-cream px-2.5 py-0.5 text-[10px] font-bold text-brand-success border border-brand-success/20 shadow-premium-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-success animate-pulse" />
                        Open
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="font-serif text-base font-bold text-brand-charcoal group-hover:text-brand-primary transition-colors">{restaurant.name}</h2>
                    <p className="mt-1 line-clamp-2 text-xs text-brand-muted leading-relaxed">{restaurant.description}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-brand-muted/80 border-t border-brand-border/40 pt-3">
                      <MapPin size={11} className="text-brand-primary" />
                      <span className="truncate">{restaurant.autoLocation?.formattedAddress || "Unknown address"}</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  key={restaurant._id}
                  className="overflow-hidden rounded-2xl border border-brand-border/40 bg-brand-card opacity-60"
                >
                  <div className="relative h-48 overflow-hidden bg-brand-cream-dark">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-brand-charcoal/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-charcoal px-3.5 py-1.5 text-xs font-bold text-white border border-white/20">
                        <Clock size={12} />
                        Closed
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="font-serif text-base font-bold text-brand-muted">{restaurant.name}</h2>
                    <p className="mt-1 line-clamp-2 text-xs text-brand-muted/70">{restaurant.description}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-brand-muted/65 border-t border-brand-border/40 pt-3">
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
