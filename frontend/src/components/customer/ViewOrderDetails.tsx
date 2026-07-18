import axios from "axios";
import React, { useEffect, useState } from "react";
import { restaurantService } from "../../main";
import { useParams } from "react-router-dom";
import type { IOrder } from "../../types";
import { useSocket } from "../../context/socketContext";
import { UserOrderMap } from "./UserOrderMap";
import { MapPin, Phone, Package, Clock, CreditCard, Bike, IndianRupee, Navigation } from "lucide-react";
import {
 ShoppingCart,
  CheckCircle,
  ChefHat,
  PackageCheck,
} from "lucide-react";
type NumericValue = number | Number | null | undefined;

const STATUS_STEPS = [
  {
    key: "placed",
    label: "Placed",
    icon: ShoppingCart,
  },
  {
    key: "accepted",
    label: "Accepted",
    icon: CheckCircle,
  },
  {
    key: "preparing",
    label: "Preparing",
    icon: ChefHat,
  },
  {
    key: "ready_for_rider",
    label: "Ready",
    icon: PackageCheck,
  },
  {
    key: "rider_assigned",
    label: "Rider",
    icon: Bike,
  },
  {
    key: "picked_up",
    label: "Picked",
    icon: Package,
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CheckCircle,
  },
];
const STATUS_COLORS: Record<string, string> = {
  placed:          "bg-amber-500/10 text-amber-500 border border-amber-500/20",
  accepted:        "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  preparing:       "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20",
  ready_for_rider: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  rider_assigned:  "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20",
  picked_up:       "bg-violet-500/10 text-violet-500 border border-violet-500/20",
  delivered:       "bg-brand-success/10 text-brand-success border border-brand-success/20",
  cancelled:       "bg-brand-error/10 text-brand-error border border-brand-error/20",
};

const ViewOrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = React.useState<IOrder | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { socket } = useSocket();

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${restaurantService}/api/order/order/${orderId}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      setOrder(data.order ?? null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!socket) return;
    const handleOrderUpdate = (order: any) => { setOrder(order); };
    socket.on("rider_assigned", handleOrderUpdate);
    return () => { socket.off("rider_assigned", handleOrderUpdate); };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handleStatusUpdate = (data: { orderId: string; status: string }) => {
      if (data.orderId === orderId) {
        setOrder((prev) => prev ? { ...prev, status: data.status as any } : prev);
      }
    };
    socket.on("order_status_updated", handleStatusUpdate);
    return () => { socket.off("order_status_updated", handleStatusUpdate); };
  }, [socket, orderId]);

  useEffect(() => {
    if (!socket || !orderId) return;
    socket.emit("join_room", `order_${orderId}`);
    return () => { socket.emit("leave", `order_${orderId}`); };
  }, [socket, orderId]);

  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!socket) return;
    const onRiderLocationUpdate = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      setRiderLocation([latitude, longitude]);
    };
    socket.on("riderLocationUpdate", onRiderLocationUpdate);
    return () => { socket.off("riderLocationUpdate", onRiderLocationUpdate); };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.onAny((event, ...args) => { console.log("EVENT:", event, args); });
    return () => { socket.offAny(); };
  }, [socket]);

  React.useEffect(() => { fetchOrderDetails(); }, [orderId]);

  const formatMoney = (value: NumericValue) => `₹${Number(value ?? 0).toFixed(2)}`;
  const formatCount = (value: NumericValue) => Number(value ?? 0);

const currentStep = STATUS_STEPS.findIndex(
  (step) => step.key === order?.status
);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#22201B] px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-[#22201B]-dark/50 border border-[#3A352F]/40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#22201B] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-5">

        {/* Header card */}
        <div className="overflow-hidden rounded-3xl bg-[#2C2923] shadow-premium border border-[#3A352F]/60">
          <div className="h-1 bg-brand-charcoal" />
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-serif text-[10px] uppercase tracking-widest text-[#A39B8F]">Order Details</p>
              <h2 className="mt-1 font-serif text-xl font-bold text-[#EFEBE3]">{order?.restaurantName ?? "Your Order"}</h2>
              <p className="mt-0.5 font-mono text-[10px] text-[#A39B8F]">#{orderId}</p>
            </div>
            {order && (
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_COLORS[order.status] ?? "bg-[#22201B]-dark text-[#A39B8F]"}`}>
                {order.status.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        {/* OTP card */}
        {order?.otp && order.status !== "delivered" && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-secondary to-[#2c5343] p-6 text-center text-white shadow-premium">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#2C2923]/5" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/70">Delivery OTP</p>
            <h1 className="mt-3 font-serif text-5xl font-black tracking-[0.5em] text-brand-gold">{order.otp}</h1>
            <p className="mt-3 text-xs text-white/85">Share this with your rider when they arrive</p>
          </div>
        )}

        {order ? (
          <>
            {/* Progress tracker */}
            {order.status !== "cancelled" && (
              <div className="rounded-3xl bg-[#2C2923] p-5 shadow-premium border border-[#3A352F]/60">
                <h3 className="mb-5 font-serif text-xs font-bold uppercase tracking-widest text-[#A39B8F]">
                  Order Progress
                </h3>

                <div className="flex items-start justify-between">
                  {STATUS_STEPS.map((step, idx) => {
                    const done = idx <= currentStep;
                    const active = idx === currentStep;
                    const isLast = idx === STATUS_STEPS.length - 1;

                    const Icon = step.icon;

                    return (
                      <React.Fragment key={step.key}>
                        <div className="flex min-w-0 flex-col items-center">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300
                            ${
                              done
                                ? "bg-brand-primary text-white shadow-premium-sm"
                                : "bg-[#22201B]-dark text-[#A39B8F]/50"
                            }
                            ${active ? "scale-110 ring-4 ring-brand-primary/10" : ""}
                          `}
                          >
                            <Icon size={15} />
                          </div>

                          <span
                            className={`mt-2 text-center text-[9px] font-bold uppercase leading-tight
                            ${
                              done
                                ? "text-brand-primary"
                                : "text-[#A39B8F]/70"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>

                        {!isLast && (
                          <div className="mt-4.5 flex-1 px-1">
                            <div
                              className={`h-0.75 rounded-full transition-all duration-300 ${
                                idx < currentStep
                                  ? "bg-brand-primary"
                                  : "bg-brand-border"
                              }`}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Summary pills */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: <IndianRupee size={12} />, label: "Total", value: formatMoney(order.totalAmount), highlight: true },
                { icon: <CreditCard size={12} />, label: "Payment", value: order.paymentStatus },
                { icon: <CreditCard size={12} />, label: "Method", value: order.paymentMethod },
                { icon: <Clock size={12} />, label: "Placed", value: new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
              ].map(({ icon, label, value, highlight }) => (
                <div key={label} className={`rounded-2xl p-4 ${highlight ? "bg-brand-charcoal text-white" : "bg-[#2C2923] border border-[#3A352F]/60"}`}>
                  <div className={`flex items-center gap-1.5 ${highlight ? "text-white/50" : "text-[#A39B8F]"}`}>
                    {icon}
                    <p className="text-[9px] font-bold uppercase tracking-wider">{label}</p>
                  </div>
                  <p className={`mt-1.5 text-xs font-bold ${highlight ? "text-brand-gold font-serif" : "text-[#EFEBE3]"}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="rounded-3xl bg-[#2C2923] p-5 shadow-premium border border-[#3A352F]/60">
              <div className="mb-4 flex items-center gap-2">
                <Package size={15} className="text-brand-primary" />
                <h3 className="font-serif text-sm font-bold text-[#EFEBE3]">Items Ordered</h3>
                <span className="ml-auto rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-bold text-brand-primary">{order.items?.length ?? 0}</span>
              </div>
              <div className="space-y-2">
                {(order.items ?? []).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between rounded-xl bg-[#22201B]-dark/25 border border-[#3A352F]/30 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-[#EFEBE3]">{item.name}</p>
                      <p className="text-[10px] text-[#A39B8F] font-medium">x {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-[#EFEBE3]">{formatMoney(item.price * item.quantity)}</p>
                  </div>
                ))}
                {(order.items ?? []).length === 0 && (
                  <p className="text-xs text-[#A39B8F]">No items found.</p>
                )}
              </div>
            </div>

            {/* Breakdown + Delivery */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Payment breakdown */}
              <div className="rounded-3xl bg-[#2C2923] p-5 shadow-premium border border-[#3A352F]/60">
                <div className="mb-4 flex items-center gap-2">
                  <IndianRupee size={15} className="text-brand-primary" />
                  <h3 className="font-serif text-sm font-bold text-[#EFEBE3]">Bill Summary</h3>
                </div>
                <div className="space-y-2.5 text-xs">
                  {[
                    { label: "Subtotal", value: formatMoney(order.subtotal) },
                    { label: "Delivery Fee", value: formatMoney(order.deliveryFee) },
                    { label: "Platform Fee", value: formatMoney(order.platformFee) },
                    { label: "Rider Amount", value: formatMoney(order.riderAmount) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-[#A39B8F]">
                      <span>{label}</span>
                      <span className="font-semibold text-[#EFEBE3]">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-[#3A352F]/60 pt-2 font-bold text-[#EFEBE3] font-serif">
                    <span>Total</span>
                    <span className="text-brand-primary font-serif text-sm font-black">{formatMoney(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery details */}
              <div className="rounded-3xl bg-[#2C2923] p-5 shadow-premium border border-[#3A352F]/60">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin size={15} className="text-brand-primary" />
                  <h3 className="font-serif text-sm font-bold text-[#EFEBE3]">Delivery Info</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-[#A39B8F]/70" />
                    <p className="text-[#EFEBE3] font-medium leading-relaxed">{order.deliveryAddress.formattedAddress}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="shrink-0 text-[#A39B8F]/70" />
                    <p className="text-[#EFEBE3] font-semibold">{formatCount(order.deliveryAddress.mobile)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation size={13} className="shrink-0 text-[#A39B8F]/70" />
                    <p className="text-[#EFEBE3] font-semibold">{formatCount(order.distance).toFixed(1)} km</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#3A352F] bg-[#2C2923]/45 p-8 text-center text-[#A39B8F]">
            Order not found.
          </div>
        )}

        {/* Map section */}
        {(order?.status === "rider_assigned" || order?.status === "picked_up") && riderLocation ? (
          <div className="overflow-hidden rounded-3xl bg-[#2C2923] shadow-premium border border-[#3A352F]/60">
            <div className="flex items-center gap-2 border-b border-[#3A352F]/50 px-5 py-3">
              <Bike size={15} className="text-brand-primary" />
              <h2 className="font-serif text-sm font-bold text-[#EFEBE3]">Rider's Live Location</h2>
              <span className="ml-auto flex items-center gap-1 rounded-full bg-brand-success/10 px-2.5 py-1 text-[9px] font-bold text-brand-success">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-success" />
                LIVE
              </span>
            </div>
            <UserOrderMap
              riderLocation={riderLocation}
              deliveryLocation={[
                Number(order.deliveryAddress.latitude),
                Number(order.deliveryAddress.longitude),
              ]}
            />
          </div>
        ) : order?.status === "rider_assigned" && !riderLocation ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl bg-[#2C2923] p-6 text-xs text-[#A39B8F] shadow-premium-sm border border-[#3A352F]/60">
            <svg className="h-4 w-4 animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Waiting for rider location…
          </div>
        ) : null}
      </div>
    </div>
  );
};



export default ViewOrderDetails;
