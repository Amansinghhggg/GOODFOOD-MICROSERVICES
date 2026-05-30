import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { restaurantService } from "../../main";
import { MapPin, Phone } from "lucide-react";
import AllMenuItems from "./allMenuItems";
interface Restaurant {
      _id: string;
    name: string;
    description?: string;
    image: string;     
    owner: string;
    phone : number;
    isVerified: boolean;
    autoLocation: {
        type:"Point",
        coordinates:[number,number];
        formattedAddress:String;
    }
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
            const data = await axios.get(`${restaurantService}/api/restaurant/${id}`,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });
            setRestaurant(data.data.restaurant);
        } catch (error) {
            console.error("Error fetching restaurant details:", error);
        }finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchRestaurantDetails();
    }, [id]);
    return (
        <div>
            {loading ? (
                <div className="p-6 text-center">Loading...</div>
            ) : restaurant ? (
                <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-3xl overflow-hidden border border-orange-100 bg-white shadow-sm">
                        <div className="bg-linear-to-r from-[#E23774] via-[#f65d95] to-[#ff8a5c] p-10 text-white">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                                <div className="flex items-center gap-6">
                                    <div className="h-36 w-36 shrink-0 overflow-hidden rounded-3xl border border-white/30 bg-white/10 shadow-lg">
                                        <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
                                    </div>

                                    <div>
                                        <h1 className="text-3xl font-extrabold">
                                            {restaurant.name}
                                            &nbsp;&nbsp;
                                            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${restaurant.isOpen ? "bg-emerald-500" : "bg-gray-500 text-white"}`}>
                                                {restaurant.isOpen ? "Open" : "Closed"}
                                            </span>
                                        </h1>

                                        <p className="mt-2 max-w-xl text-sm text-white/90">{restaurant.description || "No description provided."}</p>

                                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                                            <div className="inline-flex items-center gap-2">
                                                <MapPin size={16} />
                                                <span className="truncate max-w-xl">{restaurant.autoLocation?.formattedAddress || "Address not available"}</span>
                                            </div>
                                            <div className="inline-flex items-center gap-2">
                                                <Phone size={16} />
                                                <span>{restaurant.phone || "-"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 lg:mt-0 lg:ml-auto text-sm text-white/90">
                                    <div>Created: {new Date(restaurant.createdAt).toLocaleDateString()}</div>
                                    <div className="mt-2">OwnerId: {(restaurant as any).owner || "-"}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <AllMenuItems restaurantId={restaurant._id} restaurantOwner={restaurant.owner} />
                </div>
            ) : (
                <div className="p-6 text-center">Restaurant not found.</div>
            )}
        </div>
    );
};

export default CustomerResView;
