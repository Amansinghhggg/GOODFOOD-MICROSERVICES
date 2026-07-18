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
            <div className="mt-6 flex h-40 items-center justify-center rounded-xl border border-[#3A352F] bg-[#2C2923] shadow-premium-sm">
                <div className="flex items-center gap-3 text-sm font-semibold text-brand-primary">
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
        <div className="mt-6 space-y-4 border-t border-[#3A352F]/60 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold font-serif text-[#EFEBE3]">Earnings Dashboard</h2>
                    <p className="text-xs text-[#A39B8F] font-medium">Track your delivery income</p>
                </div>
                <button
                    onClick={closeTab}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22201B] text-[#A39B8F] hover:bg-brand-primary/10 hover:text-brand-primary transition-all border border-[#3A352F]/40"
                >
                    <X size={15} />
                </button>
            </div>

            {/* Top 2 cards */}
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-xl border border-brand-secondary/20 bg-brand-secondary/5 p-5 shadow-premium-sm">
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-brand-secondary/5" />
                    <div className="flex items-center gap-2 text-brand-secondary/80">
                        <Calendar size={13} />
                        <p className="text-xs uppercase tracking-widest font-bold">Today's Earnings</p>
                    </div>
                    <h2 className="mt-2 text-4xl font-extrabold text-brand-secondary">₹{todayEarnings}</h2>
                    <div className="mt-4 flex items-center justify-between border-t border-brand-secondary/10 pt-2.5">
                        <span className="text-xs text-[#A39B8F] font-medium">Deliveries today</span>
                        <span className="rounded-full bg-brand-secondary/15 px-2.5 py-0.5 text-xs font-extrabold text-brand-secondary border border-brand-secondary/20">{todaysOrder}</span>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-brand-gold/25 bg-brand-gold/5 p-5 shadow-premium-sm">
                    <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-brand-gold/5" />
                    <div className="flex items-center gap-2 text-[#b07c1e]">
                        <TrendingUp size={13} />
                        <p className="text-xs uppercase tracking-widest font-bold">Lifetime Earnings</p>
                    </div>
                    <h2 className="mt-2 text-4xl font-extrabold text-brand-gold">₹{totalEarnings}</h2>
                    <div className="mt-4 flex items-center justify-between border-t border-brand-gold/15 pt-2.5">
                        <span className="text-xs text-[#A39B8F] font-medium">Total orders</span>
                        <span className="rounded-full bg-brand-gold/15 px-2.5 py-0.5 text-xs font-extrabold text-[#b07c1e] border border-brand-gold/20">{totalOrders}</span>
                    </div>
                </div>
            </div>

            {/* 3 stat pills */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Completed", value: totalOrders, icon: <Package size={14} />, color: "text-brand-secondary" },
                    { label: "Avg / Order", value: `₹${avgPerOrder}`, icon: <Zap size={14} />, color: "text-brand-primary" },
                    { label: "Today", value: todaysOrder, icon: <Calendar size={14} />, color: "text-brand-gold" },
                ].map(({ label, value, icon, color }) => (
                    <div key={label} className="rounded-xl border border-[#3A352F]/80 bg-[#22201B]/60 p-4 text-center">
                        <div className={`flex justify-center ${color} mb-1.5`}>{icon}</div>
                        <p className="text-xl font-bold text-[#EFEBE3]">{value}</p>
                        <p className="mt-0.5 text-[9px] text-[#A39B8F] font-extrabold uppercase tracking-wider">{label}</p>
                    </div>
                ))}
            </div>

            {/* Milestone bar */}
            <div className="rounded-xl border border-[#3A352F] bg-[#2C2923] p-5 shadow-premium-sm">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#EFEBE3]">₹10,000 Milestone</h3>
                    <span className="text-xs font-bold text-brand-gold">{milestoneProgress.toFixed(1)}%</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#22201B]-dark">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-primary via-brand-gold to-brand-secondary transition-all duration-700"
                        style={{ width: `${milestoneProgress}%` }}
                    />
                </div>
                <p className="mt-2.5 text-xs text-[#A39B8F] font-semibold">
                    ₹{totalEarnings.toLocaleString("en-IN")} of ₹10,000 earned
                </p>
            </div>
        </div>
    );
};

export default EarningsTab;
