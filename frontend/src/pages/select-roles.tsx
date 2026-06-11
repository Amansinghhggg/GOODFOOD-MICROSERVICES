import React, { useState } from "react";
import { useAppContext } from "../context/context";
import axios from "axios";
import { authService } from "../main";
import toast from "react-hot-toast";
import { FaUser, FaMotorcycle, FaStore, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SelectRoles = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(data.user);
      localStorage.setItem("token", data.token);
      toast.success("Role set successfully");
      navigate("/");
    } catch {
      toast.error("Failed to set role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "customer",
      title: "Customer",
      icon: <FaUser size={28} />,
      description: "Order delicious food from nearby restaurants and get it delivered fast.",
      emoji: "🍔",
    },
    {
      id: "rider",
      title: "Rider",
      icon: <FaMotorcycle size={28} />,
      description: "Deliver food, earn money, and manage your own flexible schedule.",
      emoji: "🛵",
    },
    {
      id: "owner",
      title: "Restaurant Owner",
      icon: <FaStore size={28} />,
      description: "Reach hungry customers, grow your business, and manage orders easily.",
      emoji: "🍽️",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-12 text-white sm:px-6 lg:px-8">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-[#E23774]/8 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-900/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-white/5 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/40">
            🍔 Fast • Fresh • Delivered
          </div>
          <h1 className="text-6xl font-black tracking-tight sm:text-7xl">
            GOOD<span className="text-[#E23774]">FOOD</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-white/40">
            Your all-in-one platform for ordering meals, delivering happiness, and growing restaurant businesses.
          </p>

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-white">Choose your role</h2>
            <p className="mt-1 text-sm text-white/30">How would you like to use GOODFOOD?</p>
          </div>
        </div>

        {/* Role cards */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-3">
            {roles.map((item) => {
              const isSelected = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`relative cursor-pointer rounded-2xl border p-6 text-left transition-all duration-300 hover:-translate-y-1 ${
                    isSelected
                      ? "border-[#E23774]/50 bg-[#E23774]/8 ring-1 ring-[#E23774]/30 shadow-xl shadow-[#E23774]/10"
                      : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.05]"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#E23774] shadow-lg shadow-[#E23774]/30">
                      <FaCheck size={10} />
                    </div>
                  )}

                  <div className="mb-5">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
                        isSelected ? "bg-[#E23774] text-white shadow-lg shadow-[#E23774]/30" : "bg-white/[0.06] text-white/50"
                      }`}
                    >
                      {item.icon}
                    </div>
                  </div>

                  <h3 className={`text-lg font-bold transition ${isSelected ? "text-white" : "text-white/70"}`}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/35">{item.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={!role || loading}
              className="inline-flex items-center gap-3 rounded-2xl bg-[#E23774] px-10 py-4 text-base font-bold text-white shadow-xl shadow-[#E23774]/20 transition hover:-translate-y-0.5 hover:bg-[#c72d65] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
            >
              {loading ? "Setting up..." : "Continue"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelectRoles;
