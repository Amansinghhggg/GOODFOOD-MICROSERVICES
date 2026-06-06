import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { restaurantService } from "../../main";
import { useSocket } from "../../context/socketContext";
import RessingleOrderTab from "./RessingleOrderTab";
 
const ACTIVE_STATUS    = ["placed", "accepted", "preparing", "preaparing", "ready_for_rider"];
const COMPLETED_STATUS = ["rider_assigned", "picked_up", "delivered", "cancelled"];
 
export const STATUS_TONE: Record<string, string> = {
  placed:          "bg-amber-100 text-amber-800",
  accepted:        "bg-blue-100 text-blue-800",
  preparing:       "bg-indigo-100 text-indigo-800",
  preaparing:      "bg-indigo-100 text-indigo-800",
  ready_for_rider: "bg-emerald-100 text-emerald-800",
  rider_assigned:  "bg-violet-100 text-violet-800",
  picked_up:       "bg-violet-100 text-violet-800",
};
 
export function nextStatus(status: string): string | null {
  switch (status) {
    case "placed":     return "accepted";
    case "accepted":   return "preparing";
    case "preparing":  return "ready_for_rider";
    case "ready_for_rider": return "ready_for_rider";
    default:           return null;
  }
}
 
interface Props {
  reload: boolean;
  restaurantId: string;
}
 
const ActiveOrders = ({ reload, restaurantId }: Props) => {
  const [loading, setLoading]   = useState(false);
  const [orders, setOrders]     = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
 
  // orderId → "searching" state (10s timer running)
  const [searchingOrders, setSearchingOrders] = useState<Set<string>>(new Set());
 
  const { socket } = useSocket();
 
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/order/${restaurantId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setOrders(data.orders ?? []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);
 
  useEffect(() => { fetchOrders(); }, [fetchOrders, reload]);
 
  // Socket: rider accepted → stop searching, update order
  useEffect(() => {
    if (!socket) return;
 
    const onRiderAssigned = (updatedOrder: any) => {
      // clear searching state for this order
      setSearchingOrders((prev) => {
        const next = new Set(prev);
        next.delete(updatedOrder._id);
        return next;
      });
      // update order in list
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };
 
    socket.on("order:rider_assigned", onRiderAssigned);
    return () => { socket.off("order:rider_assigned", onRiderAssigned); };
  }, [socket]);
 
  /**
   * Called when restaurant clicks any action button.
   * For ready_for_rider → rider_assigned: sends API + starts 10s timer.
   * If timer expires with no socket response, removes from searching (retry enabled).
   */
  const updateStatus = async (order: any) => {
    const next = nextStatus(order.status);
    if (!next) return;
 
    const isRiderSearch = order.status === "ready_for_rider" ;
 
    if (isRiderSearch) {
      setSearchingOrders((prev) => new Set(prev).add(order._id));
    }
 
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status: next },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const updatedOrder = data.updatedOrder;
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      // on API failure also clear searching
      setSearchingOrders((prev) => {
        const next = new Set(prev);
        next.delete(order._id);
        return next;
      });
      return;
    }
 
    if (isRiderSearch) {
      // 10s timeout — if socket hasn't cleared it, enable retry
      setTimeout(() => {
        setSearchingOrders((prev) => {
          if (!prev.has(order._id)) return prev; // already cleared by socket
          const next = new Set(prev);
          next.delete(order._id);
          return next;
        });
      }, 10_000);
    }
  };
 
  const activeOrders    = orders.filter((o) => o && ACTIVE_STATUS.includes(o.status));
  const completedOrders = orders.filter((o) => o && COMPLETED_STATUS.includes(o.status));
  const ordersToShow    = activeTab === "active" ? activeOrders : completedOrders;
 
  const tabClass = (tab: "active" | "completed") =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      activeTab === tab
        ? "bg-slate-900 text-white"
        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
    }`;
 
  if (loading) {
    return (
      <div className="flex h-16 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
        Loading Orders…
      </div>
    );
  }
 
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setActiveTab("active")} className={tabClass("active")}>
          Active Orders
          {activeOrders.length > 0 && (
            <span className="ml-2 rounded-full bg-green-500 px-1.5 py-0.5 text-xs text-white">
              {activeOrders.length}
            </span>
          )}
        </button>
        <button type="button" onClick={() => setActiveTab("completed")} className={tabClass("completed")}>
          Completed Orders
        </button>
      </div>
 
      {/* Order List */}
      {ordersToShow.length === 0 ? (
        <p className="text-sm text-gray-400">
          {activeTab === "active"
            ? "No active orders at the moment."
            : "No completed orders yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {ordersToShow.map((order) => (
            <RessingleOrderTab
              key={order._id}
              order={order}
              showAction={activeTab === "active"}
              updateStatus={updateStatus}
              statusTone={STATUS_TONE}
              nextStatus={nextStatus}
              isSearchingRider={searchingOrders.has(order._id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
 
export default ActiveOrders;