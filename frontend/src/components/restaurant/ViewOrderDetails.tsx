import axios from "axios";
import React, { useEffect, useState } from "react";
import { restaurantService } from "../../main";
import { useParams } from "react-router-dom";
import type { IOrder } from "../../types";
import { useSocket } from "../../context/socketContext";
import { UserOrderMap } from "./UserOrderMap";

type NumericValue = number | Number | null | undefined;

const ViewOrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = React.useState<IOrder | null>(null);
    const [loading, setLoading] = React.useState(false);
    const { socket } = useSocket();

    

    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${restaurantService}/api/order/order/${orderId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
          setOrder(data.order ?? null);
        } finally {
            setLoading(false);
        }
    };
    

   useEffect(() => {
  if (!socket) return;

  const handleOrderUpdate = (order: any) => {
    console.log("ORDER UPDATED:", order);

    setOrder(order);
  };

  socket.on("rider_assigned", handleOrderUpdate);

  return () => {
    socket.off("rider_assigned", handleOrderUpdate);
  };
}, [socket]);


      useEffect(() => {
        if (!socket) return;
         const handleStatusUpdate = (data: {
    orderId: string;
    status: string;
  }) => {
    if (data.orderId === orderId) {
      setOrder((prev) =>
        prev ? { ...prev, status: data.status as any } : prev
      );
    }
  };    
        socket.on("order_status_updated", handleStatusUpdate);
        return () => {
            socket.off("order_status_updated", handleStatusUpdate);
        };

    },[socket, orderId]);

    useEffect(()=>{
      if(!socket|| !orderId) return
      socket.emit("join_room",`order_${orderId}`)

      return ()=>{
        socket.emit("leave",`order_${orderId}`)
      }
    },[socket,orderId])
    const [riderLocation, setriderLocation] = useState<[number, number] | null>(null);
    
    useEffect(() => {
      if(!socket) return;
      const onRiderLoationUpdate = ({latitude,longitude}: { latitude: number; longitude: number })=>{
        console.log("Rider location update:", latitude, longitude);
        setriderLocation([latitude, longitude]);
      };
      socket.on("riderLocationUpdate", onRiderLoationUpdate);

      return () => {
        socket.off("riderLocationUpdate", onRiderLoationUpdate);
      };
    }, [socket]);
    
    useEffect(() => {
  if (!socket) return;

  socket.onAny((event, ...args) => {
    console.log("EVENT aaya hai:", event, args);
  });

  return () => {
    socket.offAny();
  };
}, [socket]);

    React.useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);
    if (loading) {
      return (
            <div className="min-h-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      );
    }

    const statusTone: Record<string, string> = {
      placed: "bg-amber-100 text-amber-800",
      accepted: "bg-blue-100 text-blue-800",
      preparing: "bg-indigo-100 text-indigo-800",
      ready_for_rider: "bg-emerald-100 text-emerald-800",
      rider_assigned: "bg-cyan-100 text-cyan-800",
      picked_up: "bg-violet-100 text-violet-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const formatMoney = (value: NumericValue) => `₹${Number(value ?? 0).toFixed(2)}`;
    const formatCount = (value: NumericValue) => Number(value ?? 0);

    return (
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Order details
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                {order?.restaurantName ?? "Order Details"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">Order ID: {orderId}</p>
            </div>
            {order && (
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${statusTone[order.status] ?? "bg-slate-100 text-slate-700"}`}
              >
                {order.status.replace(/_/g, " ")}
              </span>
            )}
          </div>
          {order?.otp && (
            <div className="mt-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center text-white shadow-lg">
              <p className="text-sm uppercase tracking-[0.3em]">Delivery OTP</p>

              <h1 className="mt-3 text-5xl font-bold tracking-[0.4em]">
                {order.otp}
              </h1>

              <p className="mt-3 text-sm text-green-100">
                Give this OTP to the rider when your order arrives.
              </p>
            </div>
          )}

          {order ? (
            <div className="mt-5 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InfoCard
                  label="Total amount"
                  value={formatMoney(order.totalAmount)}
                  highlight
                />
                <InfoCard label="Payment status" value={order.paymentStatus} />
                <InfoCard label="Payment method" value={order.paymentMethod} />
                <InfoCard
                  label="Placed at"
                  value={new Date(order.createdAt).toLocaleString()}
                />
              </div>

              <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-slate-900">Items</h3>
                <div className="mt-4 space-y-3">
                  {(order.items ?? []).map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 px-4 py-3"
                    >
                      <p className="text-base font-semibold text-slate-900">
                        {item.name} x {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-slate-600">
                        {formatMoney(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                  {(order.items ?? []).length === 0 && (
                    <p className="text-sm text-slate-500">
                      No items found for this order.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Payment breakdown
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <Row label="Subtotal" value={formatMoney(order.subtotal)} />
                    <Row
                      label="Delivery fee"
                      value={formatMoney(order.deliveryFee)}
                    />
                    <Row
                      label="Platform fee"
                      value={formatMoney(order.platformFee)}
                    />
                    <Row
                      label="Rider amount"
                      value={formatMoney(order.riderAmount)}
                    />
                    <div className="border-t border-slate-200 pt-3">
                      <Row
                        label="Total amount"
                        value={formatMoney(order.totalAmount)}
                        strong
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Delivery details
                  </h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-900">
                        Address:
                      </span>{" "}
                      {order.deliveryAddress.formattedAddress}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">
                        Mobile:
                      </span>{" "}
                      {formatCount(order.deliveryAddress.mobile)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">
                        Distance:
                      </span>{" "}
                      {formatCount(order.distance).toFixed(1)} km
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-600">
              Order not found.
            </div>
          )}
        </div>
        {(order?.status === "rider_assigned" ||
          order?.status === "picked_up") &&
        riderLocation ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">
              Rider's Current Location
            </h2>
            <UserOrderMap
              riderLocation={riderLocation}
              deliveryLocation={[
                Number(order.deliveryAddress.latitude),
                Number(order.deliveryAddress.longitude),
              ]}
            />
          </div>
        ) : order?.status === "rider_assigned" && !riderLocation ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center text-slate-500">
            Waiting for rider location...
          </div>
        ) : null}
      </div>
    );
};

  const InfoCard = ({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) => (
    <div className={`rounded-2xl p-4 ${highlight ? "bg-slate-900 text-slate-950" : "bg-white/10 text-white"}`}>
      <p className={`text-xs uppercase tracking-[0.2em] ${highlight ? "text-slate-700" : "text-slate-300"}`}>{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );

  const Row = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
    <div className="flex items-center justify-between gap-4">
      <span className={strong ? "font-semibold text-slate-900" : "text-slate-600"}>{label}</span>
      <span className={strong ? "text-base font-semibold text-slate-950" : "font-medium text-slate-900"}>{value}</span>
    </div>

  );


export default ViewOrderDetails;
