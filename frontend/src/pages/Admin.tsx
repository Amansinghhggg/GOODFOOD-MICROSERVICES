import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import { useAppContext } from "../context/context";

export const Admin = () => {
    const{setIsAuth} = useAppContext();
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [riders, setRiders] = useState<any[]>([]);
    const [loading,setloadig] = useState(true);
    const [tab,setTab] = useState<"restaurants" | "riders">("restaurants");
    const fetchRestaurants = async () => {

        setloadig(true);
        try {
        const {data} = await axios.get(`${adminService}/api/v1//admin/pendingrestaurants`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });
        
        setRestaurants(data.restaurants);
        setloadig(false);
    } catch (error) {
        console.error("Error fetching pending restaurants:", error);
        setloadig(false);
    }
}
    const fetchRiders = async () => {
        setloadig(true);
        try {
        const {data} = await axios.get(`${adminService}/api/v1/admin/pendingriders`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });
        setRiders(data.riders);
        setloadig(false);
    } catch (error) {
        console.error("Error fetching pending riders:", error);
        setloadig(false);
    }
}
    useEffect(() => {
        if(tab === "restaurants") {
            fetchRestaurants();
        }
        if(tab === "riders") {
            fetchRiders();
        }
    }, [tab]);

    function verifyRestaurant(id:string) {
    try {
    axios.patch(`${adminService}/api/v1/admin/verifyrestaurant/${id}`,{},{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
    });
    fetchRestaurants();
} catch (error) {
    console.error("Error verifying restaurant:", error);
}
}
function verifyRider(id:string) {
    try {
    axios.patch(`${adminService}/api/v1/admin/verifyrider/${id}`,{},{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
    });
    fetchRiders();
} catch (error) {
    console.error("Error verifying rider:", error);
}
}
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuth(false);
        window.location.reload();
    }

   return (
  <div className="min-h-screen bg-slate-950 p-6 text-white">
    <div className="mx-auto max-w-7xl">

      <div className="mb-6 flex items-center justify-between">
  <h1 className="text-4xl font-bold text-white">
    Admin Dashboard
  </h1>

  <button
    onClick={handleLogout}
    className="rounded-lg bg-red-500 px-5 py-2 font-medium text-white transition hover:bg-red-600"
  >
    Logout
  </button>
</div>

      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setTab("restaurants")}
          className={`rounded-lg px-5 py-2 font-medium ${
            tab === "restaurants"
              ? "bg-red-500 text-white"
              : "bg-slate-800"
          }`}
        >
          Restaurants ({restaurants.length})
        </button>

        <button
          onClick={() => setTab("riders")}
          className={`rounded-lg px-5 py-2 font-medium ${
            tab === "riders"
              ? "bg-red-500 text-white"
              : "bg-slate-800"
          }`}
        >
          Riders ({riders.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center text-xl">
          Loading...
        </div>
      ) : (
        <>
          {tab === "restaurants" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant: any) => (
                <div
                  key={restaurant._id}
                  className="overflow-hidden rounded-2xl bg-slate-900 shadow-lg"
                >
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="h-52 w-full object-cover"
                  />

                  <div className="p-5">
                    <h2 className="text-xl font-bold">
                      {restaurant.name}
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                      {restaurant.description}
                    </p>

                    <div className="mt-4 space-y-2 text-sm">
                      <p>
                        📞 {restaurant.phone}
                      </p>

                      <p>
                        📍 {restaurant.autoLocation?.formattedAddress}
                      </p>

                      <p>
                        Owner ID: {restaurant.owner}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        verifyRestaurant(restaurant._id)
                      }
                      className="mt-5 w-full rounded-lg bg-green-500 py-2 font-semibold text-black hover:bg-green-400"
                    >
                      Verify Restaurant
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "riders" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {riders.map((rider: any) => (
                <div
                  key={rider._id}
                  className="rounded-2xl bg-slate-900 p-5 shadow-lg"
                >
                  <img
                    src={rider.picture}
                    alt=""
                    className="mx-auto mb-4 h-28 w-28 rounded-full object-cover"
                  />

                  <h2 className="text-center text-xl font-bold">
                    Rider
                  </h2>

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      📞 {rider.phoneNumber}
                    </p>

                    <p>
                      🪪 {rider.aadharNumber}
                    </p>

                    <p>
                      🚗 {rider.drivingLicenseNumber}
                    </p>

                    <p>
                      🟢 Available:{" "}
                      {rider.isAvailable ? "Yes" : "No"}
                    </p>

                    <p>
                      📍 {rider.location?.coordinates?.join(", ")}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      verifyRider(rider._id)
                    }
                    className="mt-5 w-full rounded-lg bg-green-500 py-2 font-semibold text-black hover:bg-green-400"
                  >
                    Verify Rider
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
};
