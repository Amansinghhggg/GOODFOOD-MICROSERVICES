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
  placed:          "bg-amber-100 text-amber-700",
  accepted:        "bg-blue-100 text-blue-700",
  preparing:       "bg-indigo-100 text-indigo-700",
  ready_for_rider: "bg-emerald-100 text-emerald-700",
  rider_assigned:  "bg-cyan-100 text-cyan-700",
  picked_up:       "bg-violet-100 text-violet-700",
  delivered:       "bg-green-100 text-green-700",
  cancelled:       "bg-red-100 text-red-700",
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white shadow-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-4">

        {/* Header card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-rose-100">
          <div className="h-1.5 bg-slate-900" />
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Order Details</p>
              <h2 className="mt-1 text-xl font-black text-slate-900">{order?.restaurantName ?? "Your Order"}</h2>
              <p className="mt-0.5 font-mono text-xs text-slate-400">#{orderId?.slice(-12)}</p>
            </div>
            {order && (
              <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest ${STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-600"}`}>
                {order.status.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>

        {/* OTP card */}
        {order?.otp && order.status !== "delivered" && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-center text-white shadow-xl shadow-green-200">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
            <p className="text-xs uppercase tracking-[0.4em] text-green-100">Delivery OTP</p>
            <h1 className="mt-3 text-6xl font-black tracking-[0.5em] drop-shadow">{order.otp}</h1>
            <p className="mt-3 text-sm text-green-100">Share this with your rider when they arrive</p>
          </div>
        )}

        {order ? (
          <>
            {/* Progress tracker */}
           {order.status !== "cancelled" && (
  <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rose-100">
    <h3 className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">
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
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300
                ${
                  done
                    ? "bg-[#E23774] text-white shadow-lg shadow-rose-200"
                    : "bg-slate-100 text-slate-400"
                }
                ${active ? "scale-110 ring-4 ring-rose-100" : ""}
              `}
              >
                <Icon size={18} />
              </div>

              <span
                className={`mt-2 text-center text-[10px] font-semibold uppercase leading-tight
                ${
                  done
                    ? "text-[#E23774]"
                    : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {!isLast && (
              <div className="mt-5 flex-1 px-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx < currentStep
                      ? "bg-[#E23774]"
                      : "bg-slate-200"
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
                { icon: <IndianRupee size={14} />, label: "Total", value: formatMoney(order.totalAmount), highlight: true },
                { icon: <CreditCard size={14} />, label: "Payment", value: order.paymentStatus },
                { icon: <CreditCard size={14} />, label: "Method", value: order.paymentMethod },
                { icon: <Clock size={14} />, label: "Placed", value: new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) },
              ].map(({ icon, label, value, highlight }) => (
                <div key={label} className={`rounded-2xl p-4 ${highlight ? "bg-slate-900 text-white" : "bg-white ring-1 ring-slate-100"}`}>
                  <div className={`flex items-center gap-1.5 ${highlight ? "text-white/50" : "text-slate-400"}`}>
                    {icon}
                    <p className="text-[10px] uppercase tracking-wider">{label}</p>
                  </div>
                  <p className={`mt-1.5 text-sm font-black ${highlight ? "text-white" : "text-slate-800"}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rose-100">
              <div className="mb-4 flex items-center gap-2">
                <Package size={15} className="text-[#E23774]" />
                <h3 className="text-sm font-bold text-slate-800">Items Ordered</h3>
                <span className="ml-auto rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-[#E23774]">{order.items?.length ?? 0}</span>
              </div>
              <div className="space-y-2">
                {(order.items ?? []).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400">x {item.quantity}</p>
                    </div>
                    <p className="text-sm font-black text-slate-800">{formatMoney(item.price * item.quantity)}</p>
                  </div>
                ))}
                {(order.items ?? []).length === 0 && (
                  <p className="text-sm text-slate-400">No items found.</p>
                )}
              </div>
            </div>

            {/* Breakdown + Delivery */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Payment breakdown */}
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rose-100">
                <div className="mb-4 flex items-center gap-2">
                  <IndianRupee size={15} className="text-[#E23774]" />
                  <h3 className="text-sm font-bold text-slate-800">Bill Summary</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Subtotal", value: formatMoney(order.subtotal) },
                    { label: "Delivery Fee", value: formatMoney(order.deliveryFee) },
                    { label: "Platform Fee", value: formatMoney(order.platformFee) },
                    { label: "Rider Amount", value: formatMoney(order.riderAmount) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-slate-600">
                      <span>{label}</span>
                      <span className="font-medium text-slate-800">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-slate-100 pt-2 font-black text-slate-900">
                    <span>Total</span>
                    <span className="text-[#E23774]">{formatMoney(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery details */}
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rose-100">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin size={15} className="text-[#E23774]" />
                  <h3 className="text-sm font-bold text-slate-800">Delivery Info</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-slate-400" />
                    <p className="text-slate-700">{order.deliveryAddress.formattedAddress}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="shrink-0 text-slate-400" />
                    <p className="text-slate-700">{formatCount(order.deliveryAddress.mobile)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation size={13} className="shrink-0 text-slate-400" />
                    <p className="text-slate-700">{formatCount(order.distance).toFixed(1)} km</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-rose-100 bg-white p-8 text-center text-slate-400">
            Order not found.
          </div>
        )}

        {/* Map section */}
        {(order?.status === "rider_assigned" || order?.status === "picked_up") && riderLocation ? (
          <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-rose-100">
            <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
              <Bike size={15} className="text-[#E23774]" />
              <h2 className="text-sm font-bold text-slate-800">Rider's Live Location</h2>
              <span className="ml-auto flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold text-green-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
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
          <div className="flex items-center justify-center gap-3 rounded-3xl bg-white p-6 text-sm text-slate-400 shadow-sm ring-1 ring-rose-100">
            <svg className="h-4 w-4 animate-spin text-[#E23774]" viewBox="0 0 24 24" fill="none">
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

const Row = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex items-center justify-between gap-4">
    <span className={strong ? "font-semibold text-slate-900" : "text-slate-600"}>{label}</span>
    <span className={strong ? "text-base font-semibold text-slate-900" : "font-medium text-slate-900"}>{value}</span>
  </div>
);

export default ViewOrderDetails;
