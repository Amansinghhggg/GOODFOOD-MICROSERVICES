import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { restaurantService } from "../../main";
import { useSocket } from "../../context/socketContext";
import RessingleOrderTab from "./RessingleOrderTab";
import toast from "react-hot-toast";

const ACTIVE_STATUS    = ["placed", "accepted", "preparing", "preaparing", "ready_for_rider"];
const COMPLETED_STATUS = ["rider_assigned", "picked_up", "delivered", "cancelled"];

export const STATUS_TONE: Record<string, string> = {
  placed:          "bg-brand-gold/10 text-[#a3721a] ring-1 ring-brand-gold/20",
  accepted:        "bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20",
  preparing:       "bg-teal-50 text-teal-800 ring-1 ring-teal-200/50",
  preaparing:      "bg-teal-50 text-teal-800 ring-1 ring-teal-200/50",
  ready_for_rider: "bg-brand-secondary/10 text-brand-secondary ring-1 ring-brand-secondary/20",
  rider_assigned:  "bg-purple-50 text-purple-800 ring-1 ring-purple-200/50",
  picked_up:       "bg-purple-50 text-purple-800 ring-1 ring-purple-200/50",
};

export function nextStatus(status: string): string | null {
  switch (status) {
    case "placed":          return "accepted";
    case "accepted":        return "preparing";
    case "preparing":       return "ready_for_rider";
    case "ready_for_rider": return "ready_for_rider";
    default:                return null;
  }
}

interface Props {
  reload: boolean;
  restaurantId: string;
}

const ActiveOrders = ({ reload, restaurantId }: Props) => {
  const [loading, setLoading]     = useState(false);
  const [orders, setOrders]       = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
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

  useEffect(() => {
    if (!socket) return;
    const onRiderAssigned = (updatedOrder: any) => {
      if(updatedOrder.status === "rider_assigned"){
        toast.success("Rider assigned for order " + updatedOrder._id);
      }
      setSearchingOrders((prev) => {
        const next = new Set(prev);
        next.delete(updatedOrder._id);
        return next;
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };
    socket.on("rider_assigned", onRiderAssigned);
    return () => { socket.off("rider_assigned", onRiderAssigned); };
  }, [socket]);

  const updateStatus = async (order: any) => {
    const next = nextStatus(order.status);
    if (!next) return;
    const isRiderSearch = order.status === "ready_for_rider";
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
      setSearchingOrders((prev) => {
        const next = new Set(prev);
        next.delete(order._id);
        return next;
      });
      return;
    }
    if (isRiderSearch) {
      setTimeout(() => {
        setSearchingOrders((prev) => {
          if (!prev.has(order._id)) return prev;
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

  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-brand-border bg-white shadow-premium-sm">
        <div className="flex items-center gap-3 text-sm font-semibold text-brand-primary">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Loading orders…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center gap-1.5 rounded-xl bg-brand-cream-dark p-1.5 w-fit border border-brand-border/60">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            activeTab === "active"
              ? "bg-white text-brand-charcoal border border-brand-border/40 shadow-premium-sm"
              : "text-brand-muted hover:text-brand-charcoal"
          }`}
        >
          Active
          {activeOrders.length > 0 && (
            <span className="rounded-full bg-brand-primary px-2 py-0.5 text-[10px] font-extrabold text-white">
              {activeOrders.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
            activeTab === "completed"
              ? "bg-white text-brand-charcoal border border-brand-border/40 shadow-premium-sm"
              : "text-brand-muted hover:text-brand-charcoal"
          }`}
        >
          Completed
          {completedOrders.length > 0 && (
            <span className="rounded-full bg-brand-muted/40 px-2 py-0.5 text-[10px] font-extrabold text-brand-charcoal">
              {completedOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Order list */}
      {ordersToShow.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-brand-border bg-white shadow-premium py-14 text-center">
          <div className="mb-3 text-4xl">🍽️</div>
          <p className="text-sm font-semibold text-brand-muted">
            {activeTab === "active" ? "No active orders right now" : "No completed orders yet"}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {ordersToShow.map((order) => (
            <RessingleOrderTab
              isCompleted={COMPLETED_STATUS.includes(order.status)}
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
