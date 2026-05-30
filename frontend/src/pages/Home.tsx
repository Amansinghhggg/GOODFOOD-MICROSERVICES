import { useEffect, useState } from "react";
import { useAppContext } from "../context/context"
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { restaurantService } from "../main";

export default function Home() {
    const {location} = useAppContext();
    const searchParams = useSearchParams()[0];
    const search =searchParams.get("search") || "";
    const [loading ,setLoading] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
        async function fetchRestaurants() {
            if(!location?.latitude || !location?.longitude) return;

            setLoading(true);
            try {
                const response = await axios.get(`${restaurantService}/api/restaurant/all`,{
                    params: {
                        latitude: location?.latitude,
                        longitude: location?.longitude,
                        search
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = response.data;
                console.log("Fetched restaurants:", data);
                if (data.success) {
                    setRestaurants(data.restaurants);
                }
            } catch (error) {
                console.error("Error fetching restaurants:", error);
            } finally {
                setLoading(false);
            }
        }

        useEffect(()=>{
            fetchRestaurants();

        },[search,location])

    return(
        <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Nearby Restaurants</h1>
                <p className="mt-2 text-sm text-slate-500">
                    {location ? `Showing results near ${location.formattedAddress}` : "Getting your location..."}
                </p>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-orange-100 bg-white p-6 text-slate-600 shadow-sm">Loading restaurants...</div>
            ) : restaurants.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-6 text-slate-600 shadow-sm">
                    No nearby restaurants found.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {restaurants.map((restaurant: any) => (
                        (restaurant.isOpen)?(
                        <Link to={`/restaurant/${restaurant._id}`} key={restaurant._id} className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div key={restaurant._id} className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
                            <img src={restaurant.image} alt={restaurant.name} className="h-48 w-full object-cover" />
                            <div className="p-4">
                                <h2 className="text-lg font-semibold text-slate-900">{restaurant.name}</h2>
                                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{restaurant.description}</p>
                                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                                    <span>{restaurant.autoLocation?.formattedAddress || "Unknown address"}</span>
                                    <span>{restaurant.distanceKm ? `${restaurant.distanceKm} km` : ""}</span>
                                </div>
                            </div>
                        </div>
                        </Link>):(
                            <div key={restaurant._id} className="relative overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm opacity-60 filter grayscale">
                                <img src={restaurant.image} alt={restaurant.name} className="h-48 w-full object-cover" />
                                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                    <div className="rounded-full bg-gray-800/75 px-4 py-2 text-sm font-semibold text-white">Closed</div>
                                </div>
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold text-slate-900">{restaurant.name}</h2>
                                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{restaurant.description}</p>
                                    <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                                        <span>{restaurant.autoLocation?.formattedAddress || "Unknown address"}</span>
                                        <span>{restaurant.distanceKm ? `${restaurant.distanceKm} km` : ""}</span>
                                    </div>
                                </div>
                            </div>)
                    ))}
                </div>
            )}
        </div>
    )}
    