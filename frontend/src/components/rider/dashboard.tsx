import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/context";
import { useSocket } from "../../context/socketContext";
import { riderService } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import riderNotifySound from "../../Assets/johnnybacon156-i-got-this-467997.mp3";
import IncomingOrderCart from "./iIncomingOrderCart";
import CurrentOrder from "./CurrentOrder";
import OrderMap from "./OrderMap";
import EarningsTab from "./EarningsTab";
import { LogOut, TrendingUp, Volume2, X, ShieldCheck, Clock, MapPin, Phone, ImagePlus, CreditCard, Car } from "lucide-react";

interface IRider {
    _id: string;
    picture: string;
    phoneNumber: string;
    aadharNumber: string;
    drivingLicenseNumber: string;
    isVerified: boolean;
    isAvailable: boolean;
}

const Dashboard = () => {
    const { user, location, fetchLocation, city} = useAppContext();

    const [earnTab, setEarnTab] = useState<any>(false);
    const { socket } = useSocket();
    const [profile, setProfile] = useState<IRider | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [togggling, setToggling] = useState<boolean>(false);
    const [picture, setPicture] = useState<File | null>(null);
    const [picturePreview, setPicturePreview] = useState<string | null>(null);
    const navigate = useNavigate();
    const [incomingOrder, setIncomingOrder] = useState<any>([]);
    const [currentOrder, setCurrentOrder] = useState<any>(null);
    const [audioUnlocked, setAudioUnlocked] = useState<boolean>(() => {
        try { return localStorage.getItem("audioEnabled") === "true"; }
        catch { return false; }
    });
    const [showAudioPrompt, setShowAudioPrompt] = useState<boolean>(() => {
        try { return localStorage.getItem("audioPromptDismissed") !== "true"; }
        catch { return true; }
    });
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(riderNotifySound);
        audioRef.current.preload = "auto";
        audioRef.current.volume = 1;
        audioRef.current.muted = false;
    }, []);

    const unlockAudio = async () => {
        if (currentOrder) return;
        try {
            if (!audioRef.current) return;
            await audioRef.current.play();
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setAudioUnlocked(true);
            toast.success("Sound Enabled");
        } catch {
            toast.error("Tap again to enable sound");
        }
    };

    useEffect(() => {
        if (!socket) return;
        const onOrderAvailable = (payload:any) => {
            console.log("Received new order notification:", payload);
            const { orderId } = payload;
            setIncomingOrder((prev: any[]) => {
  const exists = prev.some(
    (order) => order.orderId === payload.orderId
  );

  return exists ? prev : [...prev, payload];
});
            if (audioUnlocked && audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch((e) => console.log("Error playing sound:", e));
            }
            setTimeout(() => {
  setIncomingOrder((prev: any[]) =>
    prev.filter((order) => order.orderId !== payload.orderId)
  );
}, 10000);
        };
        socket.on("order_ready_for_rider", onOrderAvailable);
        console.log("ready order",);
        return () => { socket.off("order_ready_for_rider", onOrderAvailable); };
    }, [socket, audioUnlocked]);

    const fetchCurrentOrder = async () => {
        try {
            const response = await axios.get(`${riderService}/api/rider/order/current`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setCurrentOrder(response.data.order);
        } catch (error: any) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (profile) fetchCurrentOrder();
    }, [profile]);

    const [formData, setFormData] = useState({
        phoneNumber: "",
        aadharNumber: "",
        drivingLicenseNumber: "",
    });
    const [creating, setCreating] = useState<boolean>(false);

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${riderService}/api/rider/myprofile`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
            });
            const data = await response.json();
            setProfile(data.account || null);
            setLoading(false);
        } catch (error) {
            setProfile(null);
            console.error("Error fetching profile:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === "rider") fetchProfile();
        else setLoading(false);
    }, [user]);

    const toggleAvailability = async () => {
        setToggling(true);
        fetchLocation();
        try {
            await axios.patch(`${riderService}/api/rider/toggle`, {
                latitude: location?.latitude,
                longitude: location?.longitude,
                isAvailable: !profile?.isAvailable,
            }, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
            });
            fetchProfile();
            toast.success(profile?.isAvailable ? "You are now Offline" : "You are now Online");
        } catch (error) {
            toast.error("Error toggling availability");
            console.error("Error toggling availability:", error);
        } finally {
            setToggling(false);
        }
    };

    const handleLogout = () => {
        if (profile?.isAvailable) {
            toast.error("Please go offline before logging out");
            return;
        }
        localStorage.removeItem("token");
        navigate("/login");
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-950">
                <div className="flex items-center gap-3 text-sm text-yellow-400">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading rider details…
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        const data = new FormData();
        if (picture) data.append("file", picture);
        data.append("phoneNumber", formData.phoneNumber);
        data.append("aadharNumber", formData.aadharNumber);
        data.append("drivingLicenseNumber", formData.drivingLicenseNumber);
        data.append("latitude", String(location?.latitude));
        data.append("longitude", String(location?.longitude));
        try {
            await axios.post(`${riderService}/api/rider/create`, data, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Rider profile created successfully");
            fetchProfile();
        } catch (error) {
            toast.error("Error creating rider profile");
            console.error("Error creating rider profile:", error);
        } finally {
            setCreating(false);
        }
    };

    // ── No profile: registration form ──
    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-950 px-4 py-10">
                <div className="mx-auto max-w-lg">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-600/20 text-3xl">🛵</div>
                        <h1 className="text-2xl font-black text-white">Become a Rider</h1>
                        <p className="mt-1 text-sm text-gray-500">Fill in your details to start delivering</p>
                    </div>

                    <form onSubmit={handleSubmit} className="rounded-3xl border border-yellow-500/20 bg-black/60 p-6 backdrop-blur-sm space-y-5">
                        {/* Picture */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Profile Picture</label>
                            <label className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-yellow-500/20 bg-white/5 transition hover:border-yellow-500/50">
                                {picturePreview ? (
                                    <img src={picturePreview} alt="preview" className="h-36 w-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-8 text-yellow-500/30 group-hover:text-yellow-500/60">
                                        <ImagePlus size={28} />
                                        <span className="text-xs font-medium text-gray-500">Upload photo</span>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={(e) => {
                                    const f = e.target.files?.[0] || null;
                                    setPicture(f);
                                    if (f) setPicturePreview(URL.createObjectURL(f));
                                }} className="absolute inset-0 cursor-pointer opacity-0" />
                            </label>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Phone Number</label>
                            <div className="relative">
                                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    type="tel" placeholder="9876543210"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full rounded-xl border border-yellow-500/20 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20"
                                />
                            </div>
                        </div>

                        {/* Aadhaar */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Aadhaar Number</label>
                            <div className="relative">
                                <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    type="text" placeholder="XXXX XXXX XXXX"
                                    value={formData.aadharNumber}
                                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                                    className="w-full rounded-xl border border-yellow-500/20 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20"
                                />
                            </div>
                        </div>

                        {/* DL */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Driving License</label>
                            <div className="relative">
                                <Car size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    type="text" placeholder="MHXXXXXXXXXXXX"
                                    value={formData.drivingLicenseNumber}
                                    onChange={(e) => setFormData({ ...formData, drivingLicenseNumber: e.target.value })}
                                    className="w-full rounded-xl border border-yellow-500/20 bg-black/40 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/20"
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={creating}
                            className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-pink-500 py-3 text-sm font-bold text-white shadow-lg shadow-pink-900/30 transition hover:from-pink-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {creating ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Creating Profile…
                                </span>
                            ) : "Create Rider Profile"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ── Main dashboard ──
    return (
        <div className="min-h-screen bg-gray-950 px-4 py-6">
            <div className="mx-auto max-w-lg space-y-4">

                {/* Audio prompt banner */}
                {!audioUnlocked && showAudioPrompt && (
                    <div className="relative flex items-start gap-3 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                        <Volume2 size={18} className="mt-0.5 shrink-0 text-yellow-400" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-white">Enable order notifications</p>
                            <p className="mt-0.5 text-xs text-gray-500">Allow sound so you hear new incoming orders.</p>
                            <button onClick={unlockAudio} className="mt-2 rounded-lg bg-yellow-500/20 px-3 py-1.5 text-xs font-bold text-yellow-400 transition hover:bg-yellow-500/30">
                                Enable Sound
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setShowAudioPrompt(false);
                                try { localStorage.setItem("audioPromptDismissed", "true"); } catch {}
                            }}
                            className="text-gray-600 transition hover:text-gray-400"
                        >
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* Profile card */}
                <div className="rounded-3xl border border-yellow-500/20 bg-black/60 p-6 backdrop-blur-sm">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={profile.picture} alt="Rider" className="h-20 w-20 rounded-2xl border-2 border-pink-500/50 object-cover" />
                            <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-gray-950 ${profile.isAvailable ? "bg-green-400" : "bg-gray-600"}`} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white">Rider Profile</h2>
                            <p className="text-sm text-gray-400">{profile.phoneNumber}</p>
                            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${profile.isAvailable ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                                {profile.isAvailable ? "● Online" : "○ Offline"}
                            </span>
                        </div>
                    </div>

                    {/* Stats grid */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                <ShieldCheck size={12} />
                                <span className="text-[10px] uppercase tracking-wider">Verification</span>
                            </div>
                            <p className={`text-sm font-bold ${profile.isVerified ? "text-green-400" : "text-yellow-400"}`}>
                                {profile.isVerified ? "Verified ✓" : "Pending"}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                <MapPin size={12} />
                                <span className="text-[10px] uppercase tracking-wider">City</span>
                            </div>
                            <p className="text-sm font-bold text-white">{city || "Unknown"}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                <Clock size={12} />
                                <span className="text-[10px] uppercase tracking-wider">Last Active</span>
                            </div>
                            <p className="text-sm font-bold text-white">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                <TrendingUp size={12} />
                                <span className="text-[10px] uppercase tracking-wider">Status</span>
                            </div>
                            <p className={`text-sm font-bold ${profile.isAvailable ? "text-green-400" : "text-red-400"}`}>
                                {profile.isAvailable ? "Online" : "Offline"}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        {profile.isVerified && !currentOrder && (
                            <button
                                onClick={toggleAvailability}
                                disabled={togggling}
                                className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition ${profile.isAvailable ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"} disabled:opacity-60`}
                            >
                                {togggling ? "Updating…" : profile.isAvailable ? "Go Offline" : "Go Online"}
                            </button>
                        )}
                        <button
                            onClick={() => setEarnTab((v: boolean) => !v)}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-yellow-500/20 py-2.5 text-sm font-bold text-yellow-400 transition hover:bg-yellow-500/30"
                        >
                            <TrendingUp size={14} /> Earnings
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-pink-600/20 py-2.5 text-sm font-bold text-pink-400 transition hover:bg-pink-600/30"
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    </div>

                    {/* Earnings tab */}
                    {earnTab && <EarningsTab closeTab={() => setEarnTab(false)} riderId={profile._id} />}
                </div>

                {/* Incoming orders */}
                {!currentOrder && profile.isAvailable && incomingOrder.length > 0 && (
                    <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 px-4 pt-3 pb-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-yellow-400">🔔 New Order Available</p>
                        {incomingOrder.map((order: any) => (
                            <IncomingOrderCart
                                amount={order.amount}
                                distance={order.distance}
                                key={order.orderId}
                                orderId={order.orderId}
                                onAccepted={() => { fetchProfile(); fetchCurrentOrder(); }}
                            />
                        ))}
                    </div>
                )}

                {/* Current order + map */}
                {currentOrder && (
                    <div className="space-y-3">
                        <CurrentOrder order={currentOrder} onstatusUpdate={fetchCurrentOrder} />
                        <OrderMap order={currentOrder} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
