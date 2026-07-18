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
        <div className="mt-4 space-y-4 rounded-xl border border-[#3A352F] bg-[#2C2923] p-6 shadow-premium">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#3A352F]/60 pb-3">
                <div>
                    <h2 className="text-lg font-bold font-serif text-[#EFEBE3]">Active Order</h2>
                    <p className="font-mono text-xs text-[#A39B8F]">#{order._id.slice(-10)}</p>
                </div>
                <span className="rounded-full border border-brand-secondary/20 bg-brand-secondary/5 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-secondary">
                    {order.status.replace(/_/g, " ")}
                </span>
            </div>

            {/* Earnings + Distance row */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-brand-secondary/5 border border-brand-secondary/10 p-4">
                    <div className="flex items-center gap-1.5 text-brand-secondary/80 mb-1">
                        <IndianRupee size={12} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Earnings</span>
                    </div>
                    <p className="text-3xl font-black text-brand-secondary">₹{order.riderAmount}</p>
                </div>
                <div className="rounded-xl border border-[#3A352F] bg-[#22201B]/60 p-4">
                    <div className="flex items-center gap-1.5 text-[#A39B8F] mb-1">
                        <Navigation size={12} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Distance</span>
                    </div>
                    <p className="text-3xl font-black text-[#EFEBE3]">{order.distance.toFixed(1)}<span className="text-base font-semibold text-[#A39B8F]"> km</span></p>
                </div>
            </div>

            {/* Pickup section */}
            {!isPickedUp && (
                <div className="rounded-xl border border-[#3A352F] bg-[#22201B]/30 overflow-hidden shadow-premium-sm">
                    <img src={order.restaurantId.image} alt={order.restaurantId.name} className="h-36 w-full object-cover" />
                    <div className="p-4">
                        <p className="text-[10px] uppercase tracking-widest text-brand-primary font-bold mb-1">Pickup From</p>
                        <h4 className="text-base font-bold text-[#EFEBE3]">{order.restaurantId.name}</h4>
                        <p className="mt-1 text-xs text-[#A39B8F]">{order.restaurantId.description}</p>
                        <div className="mt-3 flex items-start gap-1.5 border-t border-[#3A352F]/40 pt-3">
                            <MapPin size={13} className="mt-0.5 shrink-0 text-[#A39B8F]" />
                            <p className="text-xs text-[#A39B8F] font-medium">{order.restaurantId.autoLocation.formattedAddress}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <a href={`tel:${order.restaurantId.phone}`} className="flex items-center gap-1.5 rounded-lg bg-brand-secondary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-brand-secondary-hover shadow-premium-sm">
                                <Phone size={13} /> Call
                            </a>
                            <a href={`https://www.google.com/maps?q=${order.restaurantId.autoLocation.coordinates[1]},${order.restaurantId.autoLocation.coordinates[0]}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-brand-primary-hover shadow-premium-sm">
                                <MapPin size={13} /> Maps
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery section */}
            {isPickedUp && (
                <div className="rounded-xl border border-[#3A352F] bg-[#22201B]/30 p-4 space-y-4 shadow-premium-sm">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest text-brand-primary font-bold mb-1.5">Deliver To</p>
                        <div className="flex items-start gap-2">
                            <MapPin size={14} className="mt-0.5 shrink-0 text-[#A39B8F]" />
                            <p className="text-sm font-semibold text-[#EFEBE3]">{order.deliveryAddress.formattedAddress}</p>
                        </div>
                        <p className="flex items-center gap-2 mt-2 text-sm font-bold text-brand-primary">
                            <Phone size={13} /> {order.deliveryAddress.mobile}
                        </p>
                    </div>
                    <div className="flex gap-2 border-t border-[#3A352F]/40 pt-3">
                        <a href={`tel:${order.deliveryAddress.mobile}`} className="flex items-center gap-1.5 rounded-lg bg-brand-secondary px-4 py-2 text-xs font-bold text-white hover:bg-brand-secondary-hover shadow-premium-sm">
                            <Phone size={13} /> Call Customer
                        </a>
                        <a href={`https://www.google.com/maps?q=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-xs font-bold text-white hover:bg-brand-primary-hover shadow-premium-sm">
                            <MapPin size={13} /> Maps
                        </a>
                    </div>

                    {/* OTP */}
                    <div className="rounded-xl border border-brand-secondary/20 bg-brand-secondary/5 p-4">
                        <h4 className="font-bold text-[#EFEBE3] text-sm">Delivery OTP</h4>
                        <p className="mt-0.5 text-xs text-[#A39B8F] font-medium">Ask customer for the 4-digit OTP.</p>
                        <div className="mt-3 space-y-2">
                            <input
                                type="text"
                                maxLength={4}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                placeholder="· · · ·"
                                className="w-full rounded-lg border border-[#3A352F] bg-[#2C2923] px-4 py-2.5 text-center text-3xl font-black tracking-[0.6em] text-[#EFEBE3] outline-none transition focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 shadow-premium-sm"
                            />
                            <button
                                onClick={handleVerifyOtp}
                                disabled={verifyingOtp || otp.length !== 4}
                                className="w-full rounded-lg bg-brand-secondary py-2.5 text-sm font-bold text-white shadow-premium-sm hover:bg-brand-secondary-hover transition-all disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {verifyingOtp ? "Verifying…" : "Verify OTP & Complete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Items */}
            <div className="rounded-xl border border-[#3A352F] bg-[#22201B]/30 p-4 shadow-premium-sm">
                <div className="flex items-center gap-2 mb-3 border-b border-[#3A352F]/40 pb-2">
                    <ShoppingBag size={14} className="text-[#A39B8F]" />
                    <h3 className="text-sm font-bold font-serif text-[#EFEBE3]">Order Items</h3>
                </div>
                <div className="space-y-2">
                    {order.items.map((item: any) => (
                        <div key={item._id} className="flex items-center justify-between text-sm">
                            <span className="text-[#EFEBE3] font-semibold">{item.quantity} × {item.name}</span>
                            <span className="font-bold text-[#A39B8F]">₹{item.price}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 border-t border-[#3A352F]/40 pt-3 space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="text-[#A39B8F] font-semibold">Total</span>
                        <span className="font-bold text-[#EFEBE3]">₹{order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[#A39B8F] font-semibold">Payment</span>
                        <span className="font-extrabold text-brand-secondary">{order.paymentStatus}</span>
                    </div>
                </div>
            </div>

            {/* Action button */}
            {order.status !== "delivered" && order.status !== "picked_up" && (
                <button
                    onClick={updateOrderStatus}
                    disabled={updating || order.status === "delivered"}
                    className="w-full rounded-lg bg-brand-primary py-3 text-sm font-bold text-white shadow-premium-sm hover:bg-brand-primary-hover transition-all disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
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
