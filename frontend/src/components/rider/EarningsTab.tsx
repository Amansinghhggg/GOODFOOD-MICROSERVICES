import { useEffect, useState } from "react";
import { riderService } from "../../main";
import axios from "axios";

const EarningsTab = ({ closeTab, riderId }: { closeTab: () => void; riderId: string }) => {
    const [loading, setLoading] = useState(false);
    const [todayEarnings, setTodayEarnings] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [todaysOrder, setTodaysOrder] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    
 async function fetchTotalEarnings() {
    setLoading(true);
    try {
        const { data } = await axios.get(`${riderService}/api/rider/total/earnings/${riderId}`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
        });
        setTotalEarnings(data.TotalEarnings);
        setTotalOrders(data.TotalOrders);
      } catch (error) {
        console.error("Error fetching total earnings:", error);
    } finally {
        setLoading(false);
      }
    }
    async function fetchTodayEarnings() {
        setLoading(true);
        try {
            const { data } = await axios.get(`${riderService}/api/rider/today/earnings/${riderId}`,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });
            setTodayEarnings(data.totalEarnings);
            setTodaysOrder(data.totalOrders);
          } catch (error) {
            console.error("Error fetching today's earnings:", error);
        } finally {
            setLoading(false);
          }
    }

    useEffect(() => {
        fetchTodayEarnings();
        fetchTotalEarnings();
    }, [riderId]);

  return (
    <div className="space-y-6">

  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold text-white">
        Earnings Dashboard
      </h1>
      <p className="text-sm text-gray-400">
        Track your delivery performance and income
      </p>
    </div>

    <button
      onClick={closeTab}
      className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/30"
    >
      ✕ Close
    </button>
  </div>

  {/* Top Cards */}
  <div className="grid gap-4 md:grid-cols-2">

    <div className="rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/20 to-green-900/10 p-6">
      <p className="text-sm uppercase tracking-wider text-green-300">
        Today's Earnings
      </p>

      <h2 className="mt-3 text-5xl font-extrabold text-green-400">
        ₹{todayEarnings}
      </h2>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          Deliveries Today
        </span>

        <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-300">
          {todaysOrder}
        </span>
      </div>
    </div>

    <div className="rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/20 to-yellow-900/10 p-6">
      <p className="text-sm uppercase tracking-wider text-yellow-300">
        Lifetime Earnings
      </p>

      <h2 className="mt-3 text-5xl font-extrabold text-yellow-400">
        ₹{totalEarnings}
      </h2>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          Completed Orders
        </span>

        <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-semibold text-yellow-300">
          {totalOrders}
        </span>
      </div>
    </div>

  </div>

  {/* Stats */}
  <div className="grid gap-4 md:grid-cols-3">

    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
      <p className="text-sm text-gray-400">
        Orders Completed
      </p>

      <h3 className="mt-3 text-3xl font-bold text-white">
        {totalOrders}
      </h3>
    </div>

    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
      <p className="text-sm text-gray-400">
        Avg Per Order
      </p>

      <h3 className="mt-3 text-3xl font-bold text-cyan-400">
        ₹
        {totalOrders > 0
          ? (totalEarnings / totalOrders).toFixed(2)
          : "0"}
      </h3>
    </div>

    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
      <p className="text-sm text-gray-400">
        Today's Orders
      </p>

      <h3 className="mt-3 text-3xl font-bold text-pink-400">
        {todaysOrder}
      </h3>
    </div>

  </div>

  {/* Progress Card */}
  <div className="rounded-3xl border border-yellow-500/20 bg-black/40 p-6 backdrop-blur-sm">

    <h3 className="text-xl font-bold text-white">
      Rider Performance
    </h3>

    <div className="mt-5 flex items-center justify-between">
      <span className="text-gray-400">
        Average earning per delivery
      </span>

      <span className="font-semibold text-green-400">
        ₹
        {totalOrders > 0
          ? (totalEarnings / totalOrders).toFixed(2)
          : "0"}
      </span>
    </div>

    <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-800">
      <div
        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-yellow-400"
        style={{
          width: `${Math.min(
            ((totalEarnings) / 10000) * 100,
            100
          )}%`,
        }}
      />
    </div>

    <p className="mt-3 text-xs text-gray-500">
      Progress towards ₹10,000 milestone
    </p>

  </div>
  </div>
  );
};

export default EarningsTab;