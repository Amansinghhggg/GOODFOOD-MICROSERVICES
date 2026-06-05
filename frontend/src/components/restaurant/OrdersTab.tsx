import axios from "axios";
import { useEffect, useState } from "react";
import { restaurantService } from "../../main";
const ACTIVE_STATUS = ["placed", "accepted", "preparing", "preaparing", "ready_for_rider"];
const COMPLETED_STATUS = ["rider_assigned", "picked_up", "delivered", "cancelled"];

const ActiveOrders = ( {reload, restaurantId}: {reload: boolean; restaurantId: string}) => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
     const fetchOrders = async() => {
        setLoading(true);
        try {
            const {data} = await axios.get(`${restaurantService}/api/order/${restaurantId}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            setOrders(data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
        }finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchOrders();
    }, [restaurantId, reload]);

    function nextStatus(status: string) {
        switch(status){
            case "placed": return "accepted";
            case "accepted": return "preparing";
            case "preparing": return "ready_for_rider";
            case "preaparing": return "ready_for_rider";
            default: return null;
        }
    };
    const updateStatus = async (order: any) => {
        const next = nextStatus(order.status);
        if (!next) {
            return;
        }
        try {
            let {data}=await axios.put(`${restaurantService}/api/order/${order._id}`, { status: next }, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
          const updatedOrder = data.updatedOrder;

          setOrders((prev) =>
            prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)),
          );
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };
   const activeOrders = orders.filter(
     (o) => o && ACTIVE_STATUS.includes(o.status),
   );

   const completedOrders = orders.filter(
     (o) => o && COMPLETED_STATUS.includes(o.status),
   );
    if(loading){
        return <div className="h-16 flex items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">Loading Orders...</div>;
    }

    const statusTone: Record<string, string> = {
        placed: "bg-amber-100 text-amber-800",
        accepted: "bg-blue-100 text-blue-800",
        preparing: "bg-indigo-100 text-indigo-800",
        preaparing: "bg-indigo-100 text-indigo-800",
        ready_for_rider: "bg-emerald-100 text-emerald-800",
        picked_up: "bg-violet-100 text-violet-800",
    };

    const formatMoney = (value: any) => `₹${Number(value ?? 0).toFixed(2)}`;

    const ordersToShow = activeTab === "active" ? activeOrders : completedOrders;
    const tabButtonClass = (tab: "active" | "completed") =>
        `rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`;
    const cardButtonLabel = (status: string) => {
        const next = nextStatus(status);
        return next ? `Move to ${next.replace(/_/g, " ")}` : "Completed";
    };

    const renderOrderCard = (order: any, showAction: boolean) => (
        <li key={order._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-medium text-slate-500">Order ID: {order._id}</p>
                        <span className={`inline-flex rounded-full px-6 py-2 text-sm font-bold tracking-wide ${statusTone[order.status] ?? "bg-slate-100 text-slate-700"}`}>
                                            picked up
                            </span>
                    </div>

                    <div className="mt-4 space-y-2">
                        {(order.items ?? []).map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                                <p className="text-base font-semibold text-slate-900">
                                    {item.name} x {item.quantity}
                                </p>
                                <p className="text-sm font-medium text-slate-600">{formatMoney(item.price * item.quantity)}</p>
                            </div>
                        ))}
                        {(order.items ?? []).length === 0 && (
                            <p className="text-sm text-slate-500">No items found for this order.</p>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <span>Total amount: <span className="font-semibold text-slate-900">{formatMoney(order.totalAmount)}</span></span>
                        <span>Placed at: <span className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleString()}</span></span>
                    </div>
                </div>

                {showAction && (
                    <div className="sm:pt-1">
                        {nextStatus(order.status) ? (
                            <button onClick={() => updateStatus(order)} className="inline-flex rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700">
                                {cardButtonLabel(order.status)}
                            </button>
                        ) : (
                            <span className="inline-flex rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                                Completed
                            </span>
                        )}
                    </div>
                )}
            </div>
        </li>
    );
    
  return <div>
    <div className="flex items-center gap-2">
        <button type="button" onClick={() => setActiveTab("active")} className={tabButtonClass("active")}>
            Active Orders
        </button>
        <button type="button" onClick={() => setActiveTab("completed")} className={tabButtonClass("completed")}>
            Completed Orders
        </button>
    </div>

    {ordersToShow.length === 0 ? (
      <p className="mt-4 text-sm text-gray-500">
        {activeTab === "active" ? "No active orders at the moment." : "No completed orders yet."}
      </p>
    ) : (
      <ul className="space-y-4 mt-4">
        {ordersToShow.map((order: any) => renderOrderCard(order, activeTab === "active"))}
      </ul>
    )}
  </div>;
};

export default ActiveOrders;



