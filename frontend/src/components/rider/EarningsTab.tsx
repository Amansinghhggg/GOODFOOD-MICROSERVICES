import { useEffect, useState } from "react";
import { riderService } from "../../main";
import axios from "axios";
import { X, TrendingUp, Calendar, Package, Zap } from "lucide-react";

const EarningsTab = ({ closeTab, riderId }: { closeTab: () => void; riderId: string }) => {
    const [loading, setLoading] = useState(false);
    const [todayEarnings, setTodayEarnings] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [todaysOrder, setTodaysOrder] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);

    async function fetchTotalEarnings() {
        setLoading(true);
        try {
            const { data } = await axios.get(`${riderService}/api/rider/total/earnings/${riderId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
            const { data } = await axios.get(`${riderService}/api/rider/today/earnings/${riderId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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

    const avgPerOrder = totalOrders > 0 ? (totalEarnings / totalOrders).toFixed(2) : "0";
    const milestoneProgress = Math.min((totalEarnings / 10000) * 100, 100);

    if (loading) {
        return (
            <div className="mt-6 flex h-40 items-center justify-center rounded-2xl border border-yellow-500/20 bg-black/40">
                <div className="flex items-center gap-3 text-sm text-yellow-400">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading earnings…
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white">Earnings Dashboard</h2>
                    <p className="text-xs text-gray-500">Track your delivery income</p>
                </div>
                <button
                    onClick={closeTab}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-gray-400 transition hover:bg-red-500/20 hover:text-red-400"
                >
                    <X size={15} />
                </button>
            </div>

            {/* Top 2 cards */}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/20 to-green-900/10 p-5">
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-green-500/10" />
                    <div className="flex items-center gap-2 text-green-400/70">
                        <Calendar size={13} />
                        <p className="text-xs uppercase tracking-widest font-semibold">Today's Earnings</p>
                    </div>
                    <h2 className="mt-2 text-4xl font-black text-green-400">₹{todayEarnings}</h2>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Deliveries today</span>
                        <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-bold text-green-300">{todaysOrder}</span>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/20 to-yellow-900/10 p-5">
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-yellow-500/10" />
                    <div className="flex items-center gap-2 text-yellow-400/70">
                        <TrendingUp size={13} />
                        <p className="text-xs uppercase tracking-widest font-semibold">Lifetime Earnings</p>
                    </div>
                    <h2 className="mt-2 text-4xl font-black text-yellow-400">₹{totalEarnings}</h2>
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Total orders</span>
                        <span className="rounded-full bg-yellow-500/20 px-2.5 py-0.5 text-xs font-bold text-yellow-300">{totalOrders}</span>
                    </div>
                </div>
            </div>

            {/* 3 stat pills */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Completed", value: totalOrders, icon: <Package size={14} />, color: "text-white" },
                    { label: "Avg / Order", value: `₹${avgPerOrder}`, icon: <Zap size={14} />, color: "text-cyan-400" },
                    { label: "Today", value: todaysOrder, icon: <Calendar size={14} />, color: "text-pink-400" },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-center">
                        <div className={`flex justify-center ${color} mb-1 opacity-60`}>{icon}</div>
                        <p className={`text-xl font-black ${color}`}>{value}</p>
                        <p className="mt-0.5 text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
                    </div>
                ))}
            </div>

            {/* Milestone bar */}
            <div className="rounded-2xl border border-yellow-500/20 bg-black/40 p-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">₹10,000 Milestone</h3>
                    <span className="text-xs font-semibold text-yellow-400">{milestoneProgress.toFixed(1)}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/5">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 via-yellow-400 to-green-400 transition-all duration-700"
                        style={{ width: `${milestoneProgress}%` }}
                    />
                </div>
                <p className="mt-2 text-xs text-gray-600">
                    ₹{totalEarnings.toLocaleString("en-IN")} of ₹10,000 earned
                </p>
            </div>
        </div>
    );
};

export default EarningsTab;
