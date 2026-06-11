import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import { useAppContext } from "../context/context";
import { CheckCircle, Store, Bike, LogOut, Clock, MapPin, Phone, CreditCard, Car } from "lucide-react";

export const Admin = () => {
  const { setIsAuth } = useAppContext();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurants" | "riders">("restaurants");
  const [verifying, setVerifying] = useState<string | null>(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${adminService}/api/v1/admin/pendingrestaurants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRestaurants(data.restaurants);
    } catch (error) {
      console.error("Error fetching pending restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRiders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${adminService}/api/v1/admin/pendingriders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRiders(data.riders);
    } catch (error) {
      console.error("Error fetching pending riders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "restaurants") fetchRestaurants();
    if (tab === "riders") fetchRiders();
  }, [tab]);

  async function verifyRestaurant(id: string) {
    setVerifying(id);
    try {
      await axios.patch(`${adminService}/api/v1/admin/verifyrestaurant/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchRestaurants();
    } catch (error) {
      console.error("Error verifying restaurant:", error);
    } finally {
      setVerifying(null);
    }
  }

  async function verifyRider(id: string) {
    setVerifying(id);
    try {
      await axios.patch(`${adminService}/api/v1/admin/verifyrider/${id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchRiders();
    } catch (error) {
      console.error("Error verifying rider:", error);
    } finally {
      setVerifying(null);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E23774]">
              <Store size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Goodfood</p>
              <h1 className="text-lg font-black leading-none">Admin Panel</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats + Tabs */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Pending Verifications</h2>
            <p className="mt-1 text-sm text-white/40">Review and approve new listings</p>
          </div>

          <div className="flex gap-2 rounded-2xl border border-white/5 bg-white/[0.03] p-1">
            <button
              onClick={() => setTab("restaurants")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                tab === "restaurants"
                  ? "bg-[#E23774] text-white shadow-lg shadow-[#E23774]/20"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Store size={15} />
              Restaurants
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tab === "restaurants" ? "bg-white/20" : "bg-white/10"}`}>
                {restaurants.length}
              </span>
            </button>
            <button
              onClick={() => setTab("riders")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                tab === "riders"
                  ? "bg-[#E23774] text-white shadow-lg shadow-[#E23774]/20"
                  : "text-white/50 hover:text-white"
              }`}
            >
              <Bike size={15} />
              Riders
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tab === "riders" ? "bg-white/20" : "bg-white/10"}`}>
                {riders.length}
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-white/[0.04]" />
            ))}
          </div>
        ) : (
          <>
            {tab === "restaurants" && (
              <>
                {restaurants.length === 0 ? (
                  <EmptyState icon={<Store size={28} />} message="No pending restaurants" />
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {restaurants.map((restaurant: any) => (
                      <div
                        key={restaurant._id}
                        className="group overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition hover:border-white/10 hover:bg-white/[0.05]"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-4">
                            <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400 backdrop-blur-sm border border-amber-500/20">
                              Pending Verification
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          <h2 className="text-lg font-bold text-white">{restaurant.name}</h2>
                          <p className="mt-1 line-clamp-2 text-sm text-white/50">{restaurant.description}</p>

                          <div className="mt-4 space-y-2.5">
                            <InfoRow icon={<Phone size={13} />} text={restaurant.phone} />
                            <InfoRow icon={<MapPin size={13} />} text={restaurant.autoLocation?.formattedAddress} truncate />
                            <InfoRow icon={<Store size={13} />} text={`Owner: ${restaurant.owner}`} truncate />
                          </div>

                          <button
                            onClick={() => verifyRestaurant(restaurant._id)}
                            disabled={verifying === restaurant._id}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle size={16} />
                            {verifying === restaurant._id ? "Verifying..." : "Approve Restaurant"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "riders" && (
              <>
                {riders.length === 0 ? (
                  <EmptyState icon={<Bike size={28} />} message="No pending riders" />
                ) : (
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {riders.map((rider: any) => (
                      <div
                        key={rider._id}
                        className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] transition hover:border-white/10 hover:bg-white/[0.05]"
                      >
                        <div className="relative h-32 bg-gradient-to-br from-[#E23774]/20 to-purple-900/20">
                          <img
                            src={rider.picture}
                            alt="Rider"
                            className="mx-auto mt-4 h-24 w-24 rounded-full object-cover ring-4 ring-white/10"
                          />
                          <div className="absolute right-3 top-3">
                            <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                              Pending
                            </span>
                          </div>
                        </div>

                        <div className="p-5 pt-3">
                          <h2 className="text-center text-lg font-bold text-white">Delivery Rider</h2>

                          <div className="mt-4 space-y-2.5">
                            <InfoRow icon={<Phone size={13} />} text={rider.phoneNumber} />
                            <InfoRow icon={<CreditCard size={13} />} text={`Aadhar: ${rider.aadharNumber}`} />
                            <InfoRow icon={<Car size={13} />} text={`DL: ${rider.drivingLicenseNumber}`} />
                            <InfoRow
                              icon={<Clock size={13} />}
                              text={`Available: ${rider.isAvailable ? "Yes" : "No"}`}
                            />
                            {rider.location?.coordinates && (
                              <InfoRow
                                icon={<MapPin size={13} />}
                                text={rider.location.coordinates.join(", ")}
                                truncate
                              />
                            )}
                          </div>

                          <button
                            onClick={() => verifyRider(rider._id)}
                            disabled={verifying === rider._id}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <CheckCircle size={16} />
                            {verifying === rider._id ? "Verifying..." : "Approve Rider"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const InfoRow = ({ icon, text, truncate }: { icon: React.ReactNode; text: any; truncate?: boolean }) => (
  <div className="flex items-start gap-2.5 text-sm text-white/55">
    <span className="mt-0.5 shrink-0 text-white/30">{icon}</span>
    <span className={truncate ? "truncate" : ""}>{text}</span>
  </div>
);

const EmptyState = ({ icon, message }: { icon: React.ReactNode; message: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-white/30">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5">{icon}</div>
    <p className="text-sm font-medium">{message}</p>
  </div>
);
