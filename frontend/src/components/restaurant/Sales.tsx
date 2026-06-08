import axios from "axios";
import React from "react";
import { restaurantService } from "../../main";
import { TrendingUp, ShoppingBag, IndianRupee, Calendar, Award } from "lucide-react";

const Sales = () => {
  const [todaySalesData, setTodaySalesData] = React.useState<any>(null);
  const [totalSalesData, setTotalSalesData] = React.useState<any>(null);
  const [topItems, setTopItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function fetchTodaySales() {
    try {
      const response = await axios.get(`${restaurantService}/api/order/restaurant/today/earnings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTodaySalesData(response.data);
    } catch (error) {
      console.error("Error fetching today's sales:", error);
    }
  }

  async function fetchTotalSales() {
    try {
      const response = await axios.get(`${restaurantService}/api/order/restaurant/total/earnings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTotalSalesData(response.data);
    } catch (error) {
      console.error("Error fetching total sales:", error);
    }
  }

  async function fetchTopItems() {
    try {
      const response = await axios.get(`${restaurantService}/api/order/restaurant/top/items`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTopItems(response.data.topItems ?? []);
    } catch (error) {
      console.error("Error fetching top selling items:", error);
    }
  }

  React.useEffect(() => {
    setLoading(true);
    Promise.all([fetchTodaySales(), fetchTotalSales(), fetchTopItems()]).finally(() =>
      setLoading(false)
    );
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center rounded-2xl bg-rose-50">
        <div className="flex items-center gap-3 text-sm text-rose-400">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading sales data…
        </div>
      </div>
    );
  }

  // Max revenue for bar width calc
  const maxRevenue = Math.max(...topItems.map((i) => i.revenue), 1);

  const RANK_COLORS = [
    "from-amber-400 to-orange-400",
    "from-slate-400 to-slate-500",
    "from-orange-300 to-amber-300",
    "from-rose-300 to-pink-400",
  ];
  const RANK_LABELS = ["🥇", "🥈", "🥉", "4th"];

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Today */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E23774] to-[#ff6b3d] p-5 text-white shadow-lg shadow-rose-100">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-black/10" />
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2 text-white/80">
              <Calendar size={15} />
              <span className="text-xs font-semibold uppercase tracking-widest">Today's Earnings</span>
            </div>
            <div className="text-3xl font-black">
              ₹{todaySalesData?.totalEarnings?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) ?? "—"}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-white/70">
              <ShoppingBag size={13} />
              <span className="text-sm font-medium">{todaySalesData?.totalOrders ?? 0} orders today</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2 text-white/60">
              <TrendingUp size={15} />
              <span className="text-xs font-semibold uppercase tracking-widest">All-Time Earnings</span>
            </div>
            <div className="text-3xl font-black">
              ₹{totalSalesData?.totalEarnings?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) ?? "—"}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-white/50">
              <ShoppingBag size={13} />
              <span className="text-sm font-medium">{totalSalesData?.totalOrders ?? 0} total orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Items ── */}
      {topItems.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Award size={17} className="text-[#E23774]" />
            <h3 className="text-sm font-bold text-slate-800">Top Selling Items</h3>
          </div>

          <div className="space-y-4">
            {topItems.map((item, idx) => (
              <div key={item.itemId} className="space-y-1.5">
                {/* Item header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{RANK_LABELS[idx] ?? `${idx + 1}th`}</span>
                    <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-medium text-slate-600">{item.quantity} sold</span>
                    <span className="font-bold text-slate-800">₹{item.revenue.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${RANK_COLORS[idx] ?? "from-rose-300 to-pink-400"} transition-all duration-700`}
                    style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Revenue share legend */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-50 pt-4">
            {topItems.map((item, idx) => {
              const totalRev = topItems.reduce((s, i) => s + i.revenue, 0);
              const pct = ((item.revenue / totalRev) * 100).toFixed(1);
              return (
                <div key={item.itemId} className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${RANK_COLORS[idx] ?? "from-rose-300 to-pink-400"}`}
                  />
                  <span className="text-xs text-slate-500">{item.name}</span>
                  <span className="text-xs font-bold text-slate-700">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {topItems.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-100 bg-rose-50/50 py-12">
          <IndianRupee size={32} className="mb-3 text-rose-200" />
          <p className="text-sm font-medium text-slate-400">No sales data available yet</p>
        </div>
      )}
    </div>
  );
};

export default Sales;
