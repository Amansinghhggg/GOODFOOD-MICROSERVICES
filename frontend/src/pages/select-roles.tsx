import React, { useState } from "react";
import { useAppContext } from "../context/context";
import axios from "axios";
import { authService } from "../main";
import toast from "react-hot-toast";
import { FaUser, FaMotorcycle, FaStore, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ArrowRight, LogOut } from "lucide-react";

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
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
    <div className="min-h-screen bg-[#22201B] px-4 py-12 text-[#EFEBE3] sm:px-6 lg:px-8 relative">
      {/* Logout button at top right */}
      <div className="absolute top-6 right-6 sm:top-8 sm:right-8">
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-full border border-[#3A352F] bg-[#2C2923] px-4 py-2 text-xs font-bold text-[#A39B8F] shadow-sm transition hover:border-[#ff385c]/40 hover:bg-[#ff385c]/5 hover:text-[#ff385c]"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>

      <div className="relative mx-auto max-w-5xl mt-8">
        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-[#3A352F] bg-[#2C2923] px-4 py-2 text-xs font-semibold text-[#A39B8F] shadow-sm">
            🍔 Fast • Fresh • Delivered
          </div>
          <h1 className="font-serif text-5xl font-black tracking-tight sm:text-6xl text-[#EFEBE3]">
            GOOD<span className="text-[#ff385c]">FOOD</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[#A39B8F]">
            Your all-in-one platform for ordering meals, delivering happiness, and growing restaurant businesses.
          </p>

          <div className="mt-10">
            <h2 className="font-serif text-xl font-bold text-[#EFEBE3]">Choose your role</h2>
            <p className="mt-1 text-xs text-[#877E71]">How would you like to use GOODFOOD?</p>
          </div>
        </div>

        {/* Role cards */}
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-3">
            {roles.map((item) => {
              const isSelected = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  className={`relative cursor-pointer rounded-2xl border p-6 text-left transition-all duration-300 hover:-translate-y-1 ${
                    isSelected
                      ? "border-[#ff385c] bg-[#ff385c]/5 ring-1 ring-[#ff385c]/20 shadow-md"
                      : "border-[#3A352F] bg-[#2C2923] hover:border-[#ff385c]/30 hover:shadow-sm"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#ff385c] shadow-sm">
                      <FaCheck size={10} className="text-white" />
                    </div>
                  )}

                  <div className="mb-5">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-200 ${
                        isSelected
                          ? "bg-[#ff385c] text-white shadow-md"
                          : "bg-[#f0f0f0] text-[#877E71]"
                      }`}
                    >
                      {item.icon}
                    </div>
                  </div>

                  <h3 className={`font-serif text-lg font-bold transition-colors ${isSelected ? "text-[#ff385c]" : "text-[#EFEBE3]"}`}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#A39B8F] font-medium">{item.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <button
              type="submit"
              disabled={!role || loading}
              className="inline-flex items-center gap-3 rounded-xl bg-[#111111] px-10 py-4 text-sm font-bold text-white shadow-xl shadow-black/10 transition hover:bg-[#333333] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
            >
              {loading ? "Setting up..." : "Continue"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelectRoles;
