import axios from "axios";
import React from "react";
import { riderService } from "../../main";
import toast from "react-hot-toast";
import { Phone, MapPin, ShoppingBag, IndianRupee, Navigation } from "lucide-react";

interface CurrentOrderProps {
    order: any;
    onstatusUpdate: () => void;
}

type OrderStatus = "rider_assigned" | "picked_up" | "delivered";

const nextStatus = (status: OrderStatus): string => {
    switch (status) {
        case "rider_assigned": return "picked_up";
        case "picked_up":      return "delivered";
        default:               return "??????";
    }
};

const nextLabel = (status: OrderStatus): string => {
    switch (status) {
        case "rider_assigned": return "Mark as Picked Up";
        case "picked_up":      return "Mark as Delivered";
        default:               return "";
    }
};

const CurrentOrder = ({ order, onstatusUpdate }: CurrentOrderProps) => {
    const [otp, setOtp] = React.useState("");
    const [verifyingOtp, setVerifyingOtp] = React.useState(false);
    const [updating, setUpdating] = React.useState(false);
    const isPickedUp = order.status !== "rider_assigned";

    const updateOrderStatus = async () => {
        setUpdating(true);
        try {
            await axios.put(`${riderService}/api/rider/order/update/${order._id}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            onstatusUpdate();
        } catch (error) {
            console.error("Error updating order status:", error);
        } finally {
            setUpdating(false);
        }
    };

    const handleVerifyOtp = async () => {
        setVerifyingOtp(true);
        try {
            const { data } = await axios.post(`${riderService}/api/rider/order/verify/otp/${order._id}`, { otp }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (data.success) {
                toast.success("OTP verified! Delivery completed. Thank you.");
                window.location.reload();
            } else {
                toast.error("Invalid OTP. Please try again.");
            }
        } catch (error) {
            toast.error("Error verifying OTP");
            console.error("Error verifying OTP:", error);
        } finally {
            setVerifyingOtp(false);
        }
    };

    return (
        <div className="mt-4 space-y-3 rounded-3xl border border-yellow-500/20 bg-black/40 p-5 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black text-white">Active Order</h2>
                    <p className="font-mono text-xs text-gray-500">#{order._id.slice(-10)}</p>
                </div>
                <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-green-400">
                    {order.status.replace(/_/g, " ")}
                </span>
            </div>

            {/* Earnings + Distance row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-green-500/10 p-4">
                    <div className="flex items-center gap-1.5 text-green-400/60 mb-1">
                        <IndianRupee size={12} />
                        <span className="text-[10px] uppercase tracking-widest font-semibold">Earnings</span>
                    </div>
                    <p className="text-3xl font-black text-green-400">₹{order.riderAmount}</p>
                </div>
                <div className="rounded-2xl border border-yellow-500/20 bg-white/5 p-4">
                    <div className="flex items-center gap-1.5 text-yellow-400/60 mb-1">
                        <Navigation size={12} />
                        <span className="text-[10px] uppercase tracking-widest font-semibold">Distance</span>
                    </div>
                    <p className="text-3xl font-black text-white">{order.distance.toFixed(1)}<span className="text-base font-semibold text-gray-400"> km</span></p>
                </div>
            </div>

            {/* Pickup section */}
            {!isPickedUp && (
                <div className="rounded-2xl border border-yellow-500/20 bg-white/5 overflow-hidden">
                    <img src={order.restaurantId.image} alt={order.restaurantId.name} className="h-36 w-full object-cover opacity-90" />
                    <div className="p-4">
                        <p className="text-[10px] uppercase tracking-widest text-yellow-400/70 font-semibold mb-1">Pickup From</p>
                        <h4 className="text-base font-black text-white">{order.restaurantId.name}</h4>
                        <p className="mt-1 text-sm text-gray-400">{order.restaurantId.description}</p>
                        <div className="mt-2 flex items-start gap-1.5">
                            <MapPin size={13} className="mt-0.5 shrink-0 text-gray-500" />
                            <p className="text-xs text-gray-500">{order.restaurantId.autoLocation.formattedAddress}</p>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <a href={`tel:${order.restaurantId.phone}`} className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-green-500">
                                <Phone size={13} /> Call
                            </a>
                            <a href={`https://www.google.com/maps?q=${order.restaurantId.autoLocation.coordinates[1]},${order.restaurantId.autoLocation.coordinates[0]}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500">
                                <MapPin size={13} /> Maps
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery section */}
            {isPickedUp && (
                <div className="rounded-2xl border border-yellow-500/20 bg-white/5 p-4 space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-yellow-400/70 font-semibold">Deliver To</p>
                    <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 shrink-0 text-gray-500" />
                        <p className="text-sm text-gray-300">{order.deliveryAddress.formattedAddress}</p>
                    </div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
                        <Phone size={13} /> {order.deliveryAddress.mobile}
                    </p>
                    <div className="flex gap-2">
                        <a href={`tel:${order.deliveryAddress.mobile}`} className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-500">
                            <Phone size={13} /> Call Customer
                        </a>
                        <a href={`https://www.google.com/maps?q=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500">
                            <MapPin size={13} /> Maps
                        </a>
                    </div>

                    {/* OTP */}
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                        <h4 className="font-bold text-white text-sm">Delivery OTP</h4>
                        <p className="mt-0.5 text-xs text-gray-500">Ask customer for the 4-digit OTP.</p>
                        <div className="mt-3 space-y-2">
                            <input
                                type="text"
                                maxLength={4}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                placeholder="· · · ·"
                                className="w-full rounded-xl border border-yellow-500/30 bg-black/30 px-4 py-3 text-center text-3xl font-black tracking-[0.6em] text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30"
                            />
                            <button
                                onClick={handleVerifyOtp}
                                disabled={verifyingOtp || otp.length !== 4}
                                className="w-full rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {verifyingOtp ? "Verifying…" : "Verify OTP & Complete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Items */}
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag size={14} className="text-gray-400" />
                    <h3 className="text-sm font-bold text-white">Order Items</h3>
                </div>
                <div className="space-y-2">
                    {order.items.map((item: any) => (
                        <div key={item._id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{item.quantity} × {item.name}</span>
                            <span className="text-sm font-semibold text-gray-400">₹{item.price}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-3 border-t border-white/5 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total</span>
                        <span className="font-bold text-white">₹{order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment</span>
                        <span className="font-semibold text-green-400">{order.paymentStatus}</span>
                    </div>
                </div>
            </div>

            {/* Action button */}
            {order.status !== "delivered" && order.status !== "picked_up" && (
                <button
                    onClick={updateOrderStatus}
                    disabled={updating || order.status === "delivered"}
                    className="w-full rounded-2xl bg-gradient-to-r from-pink-600 to-pink-500 py-3 text-sm font-bold text-white shadow-lg shadow-pink-900/30 transition hover:from-pink-500 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                    {updating ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Updating…
                        </span>
                    ) : nextLabel(order.status as OrderStatus)}
                </button>
            )}
        </div>
    );
};

export default CurrentOrder;
