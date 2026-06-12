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
    <div className="min-h-screen bg-brand-cream px-4 py-12 text-brand-charcoal sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-5xl">
        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-brand-border bg-brand-cream-dark/50 px-4 py-2 text-xs font-semibold text-brand-muted shadow-premium-sm">
            🍔 Fast • Fresh • Delivered
          </div>
          <h1 className="font-serif text-5xl font-black tracking-tight sm:text-6xl text-brand-charcoal">
            GOOD<span className="text-brand-primary">FOOD</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-brand-muted">
            Your all-in-one platform for ordering meals, delivering happiness, and growing restaurant businesses.
          </p>

          <div className="mt-10">
            <h2 className="font-serif text-xl font-bold text-brand-charcoal">Choose your role</h2>
            <p className="mt-1 text-xs text-brand-muted">How would you like to use GOODFOOD?</p>
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
                      ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/20 shadow-premium"
                      : "border-brand-border/60 bg-brand-card hover:border-brand-primary/30 hover:shadow-premium-sm"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary shadow-md">
                      <FaCheck size={9} className="text-white" />
                    </div>
                  )}

                  <div className="mb-5">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-200 ${
                        isSelected
                          ? "bg-brand-primary text-white shadow-premium-sm"
                          : "bg-brand-cream-dark/80 text-brand-muted"
                      }`}
                    >
                      {item.icon}
                    </div>
                  </div>

                  <h3 className={`font-serif text-base font-bold transition-colors ${isSelected ? "text-brand-primary" : "text-brand-charcoal"}`}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-brand-muted">{item.description}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <button
              type="submit"
              disabled={!role || loading}
              className="inline-flex items-center gap-3 rounded-xl bg-brand-primary px-10 py-3.5 text-sm font-bold text-white shadow-premium transition hover:bg-brand-primary-hover hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40"
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
