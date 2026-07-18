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
    <div className="min-h-screen bg-[#22201B] text-[#EFEBE3]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-[#3A352F] bg-[#2C2923]/95 backdrop-blur-md shadow-premium-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white">
              <Store size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A39B8F] leading-tight">Goodfood</p>
              <h1 className="text-lg font-bold font-serif text-[#EFEBE3] leading-none">Admin Panel</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-[#3A352F] bg-[#2C2923] px-4 py-2 text-xs font-bold text-[#EFEBE3] transition hover:border-brand-primary hover:text-brand-primary shadow-premium-sm hover:shadow-premium cursor-pointer"
          >
            <LogOut size={14} className="text-[#A39B8F]" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats + Tabs */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#3A352F]/60 pb-5">
          <div>
            <h2 className="text-3xl font-black font-serif text-[#EFEBE3]">Pending Verifications</h2>
            <p className="mt-1 text-sm font-medium text-[#A39B8F]">Review and approve new listings</p>
          </div>

          <div className="flex gap-1.5 rounded-xl border border-[#3A352F]/60 bg-[#22201B]-dark p-1.5 shadow-premium-sm w-fit">
            <button
              onClick={() => setTab("restaurants")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                tab === "restaurants"
                  ? "bg-brand-primary text-white shadow-premium"
                  : "text-[#A39B8F] hover:text-[#EFEBE3]"
              }`}
            >
              <Store size={15} />
              Restaurants
              <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${tab === "restaurants" ? "bg-[#2C2923]/25 text-white" : "bg-brand-muted/20 text-[#EFEBE3]"}`}>
                {restaurants.length}
              </span>
            </button>
            <button
              onClick={() => setTab("riders")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                tab === "riders"
                  ? "bg-brand-secondary text-white shadow-premium"
                  : "text-[#A39B8F] hover:text-[#EFEBE3]"
              }`}
            >
              <Bike size={15} />
              Riders
              <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${tab === "riders" ? "bg-[#2C2923]/25 text-white" : "bg-brand-muted/20 text-[#EFEBE3]"}`}>
                {riders.length}
              </span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-xl border border-[#3A352F] bg-[#2C2923] shadow-premium" />
            ))}
          </div>
        ) : (
          <>
            {tab === "restaurants" && (
              <>
                {restaurants.length === 0 ? (
                  <EmptyState icon={<Store size={28} />} message="No pending restaurants" />
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {restaurants.map((restaurant: any) => (
                      <div
                        key={restaurant._id}
                        className="group overflow-hidden rounded-xl border border-[#3A352F] bg-[#2C2923] shadow-premium transition-all hover:shadow-premium-lg hover:-translate-y-0.5"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-4">
                            <span className="rounded-full bg-brand-gold/15 px-2.5 py-1 text-xs font-bold text-[#b07c1e] backdrop-blur-sm border border-brand-gold/25">
                              Pending Verification
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          <h2 className="text-lg font-bold font-serif text-[#EFEBE3]">{restaurant.name}</h2>
                          <p className="mt-1 line-clamp-2 text-xs text-[#A39B8F] font-medium">{restaurant.description}</p>

                          <div className="mt-4 pt-4 border-t border-[#3A352F]/40 space-y-2.5">
                            <InfoRow icon={<Phone size={13} />} text={restaurant.phone} />
                            <InfoRow icon={<MapPin size={13} />} text={restaurant.autoLocation?.formattedAddress} truncate />
                            <InfoRow icon={<Store size={13} />} text={`Owner: ${restaurant.owner}`} truncate />
                          </div>

                          <button
                            onClick={() => verifyRestaurant(restaurant._id)}
                            disabled={verifying === restaurant._id}
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-secondary py-2.5 text-sm font-bold text-white shadow-premium-sm transition hover:bg-brand-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {riders.map((rider: any) => (
                      <div
                        key={rider._id}
                        className="overflow-hidden rounded-xl border border-[#3A352F] bg-[#2C2923] shadow-premium transition-all hover:shadow-premium-lg"
                      >
                        <div className="relative h-32 bg-gradient-to-br from-brand-primary/10 to-brand-cream">
                          <img
                            src={rider.picture}
                            alt="Rider"
                            className="mx-auto mt-4 h-24 w-24 rounded-full object-cover ring-4 ring-brand-border/60 shadow-premium-sm"
                          />
                          <div className="absolute right-3 top-3">
                            <span className="rounded-full bg-brand-gold/15 px-2.5 py-1 text-xs font-bold text-[#b07c1e] border border-brand-gold/25">
                              Pending
                            </span>
                          </div>
                        </div>

                        <div className="p-5 pt-3">
                          <h2 className="text-center text-lg font-bold font-serif text-[#EFEBE3]">Delivery Rider</h2>

                          <div className="mt-4 pt-4 border-t border-[#3A352F]/40 space-y-2.5">
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
                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-secondary py-2.5 text-sm font-bold text-white shadow-premium-sm transition hover:bg-brand-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
  <div className="flex items-start gap-2.5 text-xs text-[#EFEBE3]">
    <span className="mt-0.5 shrink-0 text-[#A39B8F]">{icon}</span>
    <span className={`${truncate ? "truncate" : ""} font-semibold`}>{text}</span>
  </div>
);

const EmptyState = ({ icon, message }: { icon: React.ReactNode; message: string }) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#3A352F] bg-[#2C2923] shadow-premium py-20 text-[#A39B8F]">
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#22201B]/60 border border-[#3A352F]">{icon}</div>
    <p className="text-sm font-bold font-serif">{message}</p>
  </div>
);
